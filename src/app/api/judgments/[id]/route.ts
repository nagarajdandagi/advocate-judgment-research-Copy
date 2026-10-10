import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateOrExtractCaseBrief } from "@/lib/ai-brief";
import { formatIndianDate } from "@/lib/search-engine";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const judgment = await prisma.judgment.findUnique({
      where: { id },
      include: {
        court: true,
        citations: true,
        documents: true,
        sections: {
          include: {
            actSection: {
              include: {
                act: true,
              },
            },
          },
        },
        outwardRelations: {
          include: {
            targetJudgment: {
              include: {
                court: true,
              },
            },
          },
        },
        inwardRelations: {
          include: {
            sourceJudgment: {
              include: {
                court: true,
              },
            },
          },
        },
      },
    });

    if (!judgment) {
      return NextResponse.json({ error: "Judgment not found" }, { status: 404 });
    }

    // Fetch user-specific bookmark and notes if authenticated
    let isBookmarked = false;
    let bookmarkNotes = "";
    let personalNotes: any[] = [];
    let savedInFolders: string[] = [];

    if (user) {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_judgmentId: {
            userId: user.id,
            judgmentId: judgment.id,
          },
        },
      });
      if (bookmark) {
        isBookmarked = true;
        bookmarkNotes = bookmark.notes || "";
      }

      personalNotes = await prisma.personalNote.findMany({
        where: {
          userId: user.id,
          judgmentId: judgment.id,
        },
        orderBy: { paragraphIndex: "asc" },
      });

      const folderLinks = await prisma.researchFolderJudgment.findMany({
        where: { judgmentId: judgment.id },
        include: { folder: true },
      });
      savedInFolders = folderLinks
        .filter((fl) => fl.folder.userId === user.id)
        .map((fl) => fl.folder.name);
    }

    // Generate or extract structured case brief
    const brief = await generateOrExtractCaseBrief({
      title: judgment.title,
      courtName: judgment.court.name,
      benchName: judgment.benchName,
      coram: judgment.coram,
      judgmentDate: judgment.judgmentDate,
      caseNumber: judgment.caseNumber,
      neutralCitation: judgment.neutralCitation,
      reportedCitation: judgment.reportedCitation,
      fullText: judgment.fullText,
      sections: judgment.sections.map((s) => ({
        actShortName: s.actSection.act.shortName,
        sectionNumber: s.actSection.sectionNumber,
      })),
      briefFacts: judgment.briefFacts,
      briefIssues: judgment.briefIssues,
      briefArguments: judgment.briefArguments,
      briefQuestions: judgment.briefQuestions,
      briefReasoning: judgment.briefReasoning,
      briefOutcome: judgment.briefOutcome,
      briefRatioDecidendi: judgment.briefRatioDecidendi,
      briefObiterDicta: judgment.briefObiterDicta,
      briefEarlierCases: judgment.briefEarlierCases,
      briefFollowedOverruled: judgment.briefFollowedOverruled,
      briefAdvocateRelevance: judgment.briefAdvocateRelevance,
      briefImportantParas: judgment.briefImportantParas,
      briefLimitations: judgment.briefLimitations,
    });

    // Parse paragraphs for reading view with numbered identifiers [1], [2], etc.
    const rawParas = judgment.fullText.split(/\[(\d+)\]/g);
    const paragraphs: Array<{ index: number; text: string }> = [];

    if (rawParas.length > 1) {
      for (let i = 1; i < rawParas.length; i += 2) {
        const paraNum = parseInt(rawParas[i], 10);
        const paraContent = (rawParas[i + 1] || "").trim();
        if (paraContent) {
          paragraphs.push({ index: paraNum, text: paraContent });
        }
      }
    } else {
      // Fallback: split by newlines
      const lines = judgment.fullText.split(/\n\s*\n/).filter((l) => l.trim().length > 0);
      lines.forEach((line, idx) => {
        paragraphs.push({ index: idx + 1, text: line.trim() });
      });
    }

    return NextResponse.json({
      judgment: {
        ...judgment,
        formattedDate: formatIndianDate(judgment.judgmentDate),
        legalTopics: judgment.legalTopics ? JSON.parse(judgment.legalTopics) : [],
        folderCategories: judgment.folderCategories ? JSON.parse(judgment.folderCategories) : [],
        paragraphs,
      },
      brief,
      userState: {
        isBookmarked,
        bookmarkNotes,
        personalNotes,
        savedInFolders,
      },
    });
  } catch (error: any) {
    console.error("Judgment detail API error:", error);
    return NextResponse.json({ error: "Failed to fetch judgment details" }, { status: 500 });
  }
}
