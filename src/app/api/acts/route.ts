import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const actId = searchParams.get("actId");
    const sectionId = searchParams.get("sectionId");

    // If specific section requested with its judgments
    if (sectionId) {
      const section = await prisma.actSection.findUnique({
        where: { id: sectionId },
        include: {
          act: true,
          judgmentSections: {
            include: {
              judgment: {
                include: {
                  court: true,
                  citations: true,
                },
              },
            },
          },
        },
      });

      if (!section) {
        return NextResponse.json({ error: "Section not found" }, { status: 404 });
      }

      const judgments = section.judgmentSections.map((js) => js.judgment);
      const scJudgments = judgments.filter((j) => j.court.code === "SCI");
      const karJudgments = judgments.filter((j) => j.court.code === "HCKAR");

      return NextResponse.json({
        section,
        judgmentsCount: judgments.length,
        scCount: scJudgments.length,
        karCount: karJudgments.length,
        judgments,
      });
    }

    // Otherwise return full Acts and Sections hierarchy
    const acts = await prisma.act.findMany({
      include: {
        sections: {
          include: {
            _count: {
              select: { judgmentSections: true },
            },
            judgmentSections: {
              select: {
                judgment: {
                  select: {
                    court: {
                      select: { code: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { sectionNumber: "asc" },
        },
      },
      orderBy: [
        { category: "asc" },
        { year: "asc" },
      ],
    });

    const transformedActs = acts.map((act) => {
      // Group sections by chapter
      const chaptersMap: Record<string, {
        chapterNumber: string;
        chapterTitle: string;
        sections: Array<any>;
      }> = {};

      act.sections.forEach((sec) => {
        const chapterKey = sec.chapterNumber || "General Provisions";
        if (!chaptersMap[chapterKey]) {
          chaptersMap[chapterKey] = {
            chapterNumber: sec.chapterNumber || "General",
            chapterTitle: sec.chapterTitle || "General Provisions",
            sections: [],
          };
        }

        const scCount = sec.judgmentSections.filter(
          (js) => js.judgment.court.code === "SCI"
        ).length;
        const karCount = sec.judgmentSections.filter(
          (js) => js.judgment.court.code === "HCKAR"
        ).length;

        chaptersMap[chapterKey].sections.push({
          id: sec.id,
          sectionNumber: sec.sectionNumber,
          sectionTitle: sec.sectionTitle,
          contentSummary: sec.contentSummary,
          correspondingActName: sec.correspondingActName,
          correspondingSection: sec.correspondingSection,
          equivalenceType: sec.equivalenceType,
          transitionalGuidance: sec.transitionalGuidance,
          totalJudgments: sec._count.judgmentSections,
          scCount,
          karCount,
        });
      });

      const totalActJudgments = act.sections.reduce(
        (acc, curr) => acc + curr._count.judgmentSections,
        0
      );

      return {
        id: act.id,
        shortName: act.shortName,
        officialName: act.officialName,
        year: act.year,
        category: act.category,
        isHistorical: act.isHistorical,
        transitionalNote: act.transitionalNote,
        effectiveDate: act.effectiveDate,
        repealedOn: act.repealedOn,
        totalJudgments: totalActJudgments,
        totalSections: act.sections.length,
        chapters: Object.values(chaptersMap),
      };
    });

    return NextResponse.json({ acts: transformedActs });
  } catch (error: any) {
    console.error("Acts API error:", error);
    return NextResponse.json({ error: "Failed to load Acts library" }, { status: 500 });
  }
}
