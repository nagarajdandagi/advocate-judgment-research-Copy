import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatIndianDate } from "@/lib/search-engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("id");

    if (folderId) {
      const folder = await prisma.researchFolder.findFirst({
        where: { id: folderId, userId: user.id },
        include: {
          items: {
            include: {
              judgment: {
                include: {
                  court: true,
                  citations: true,
                  sections: {
                    include: {
                      actSection: {
                        include: {
                          act: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { addedAt: "desc" },
          },
        },
      });

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }

      const formattedItems = folder.items.map((it) => ({
        id: it.id,
        userNotes: it.userNotes,
        addedAt: it.addedAt,
        judgment: {
          id: it.judgment.id,
          title: it.judgment.title,
          court: it.judgment.court,
          benchName: it.judgment.benchName,
          caseNumber: it.judgment.caseNumber,
          formattedDate: formatIndianDate(it.judgment.judgmentDate),
          neutralCitation: it.judgment.neutralCitation,
          reportedCitation: it.judgment.reportedCitation,
          headnote: it.judgment.headnote,
          precedentialStatus: it.judgment.precedentialStatus,
          sections: it.judgment.sections.map((s) => ({
            actShortName: s.actSection.act.shortName,
            sectionNumber: s.actSection.sectionNumber,
            sectionTitle: s.actSection.sectionTitle,
          })),
        },
      }));

      return NextResponse.json({
        folder: {
          ...folder,
          items: formattedItems,
        },
      });
    }

    // List all folders for user
    const folders = await prisma.researchFolder.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        clientReference: f.clientReference,
        caseReference: f.caseReference,
        color: f.color,
        itemCount: f._count.items,
        updatedAt: f.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error("Folders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch research folders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // 1. Create a new folder
    if (action === "create_folder" || !action) {
      const { name, description, clientReference, caseReference, color } = body;
      if (!name) {
        return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
      }

      const folder = await prisma.researchFolder.create({
        data: {
          userId: user.id,
          name,
          description: description || null,
          clientReference: clientReference || null,
          caseReference: caseReference || null,
          color: color || "blue",
        },
      });

      return NextResponse.json({ success: true, folder });
    }

    // 2. Add judgment to folder
    if (action === "add_judgment") {
      const { folderId, judgmentId, userNotes } = body;
      if (!folderId || !judgmentId) {
        return NextResponse.json({ error: "folderId and judgmentId are required" }, { status: 400 });
      }

      // Verify folder ownership
      const folder = await prisma.researchFolder.findFirst({
        where: { id: folderId, userId: user.id },
      });
      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }

      const item = await prisma.researchFolderJudgment.upsert({
        where: {
          folderId_judgmentId: {
            folderId,
            judgmentId,
          },
        },
        update: {
          userNotes: userNotes || undefined,
        },
        create: {
          folderId,
          judgmentId,
          userNotes: userNotes || null,
        },
      });

      return NextResponse.json({ success: true, item });
    }

    // 3. Remove judgment from folder
    if (action === "remove_judgment") {
      const { folderId, judgmentId } = body;
      await prisma.researchFolderJudgment.deleteMany({
        where: {
          folderId,
          judgmentId,
          folder: { userId: user.id },
        },
      });

      return NextResponse.json({ success: true, message: "Judgment removed from folder" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Folders POST error:", error);
    return NextResponse.json({ error: "Failed to process folder action" }, { status: 500 });
  }
}
