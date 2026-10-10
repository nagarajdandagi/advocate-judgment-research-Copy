import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatIndianDate } from "@/lib/search-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        judgment: {
          include: {
            court: true,
            citations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const transformed = bookmarks.map((b) => ({
      id: b.id,
      judgmentId: b.judgmentId,
      notes: b.notes,
      tags: b.tags ? JSON.parse(b.tags) : [],
      createdAt: b.createdAt,
      judgment: {
        id: b.judgment.id,
        title: b.judgment.title,
        court: b.judgment.court,
        benchName: b.judgment.benchName,
        caseNumber: b.judgment.caseNumber,
        formattedDate: formatIndianDate(b.judgment.judgmentDate),
        neutralCitation: b.judgment.neutralCitation,
        reportedCitation: b.judgment.reportedCitation,
        headnote: b.judgment.headnote,
        precedentialStatus: b.judgment.precedentialStatus,
      },
    }));

    return NextResponse.json({ bookmarks: transformed });
  } catch (error: any) {
    console.error("Bookmarks GET error:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { judgmentId, notes, tags } = await req.json();
    if (!judgmentId) {
      return NextResponse.json({ error: "Judgment ID is required" }, { status: 400 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_judgmentId: {
          userId: user.id,
          judgmentId,
        },
      },
    });

    if (existing) {
      // Toggle off / delete bookmark
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ isBookmarked: false, message: "Bookmark removed" });
    } else {
      // Create new bookmark
      const created = await prisma.bookmark.create({
        data: {
          userId: user.id,
          judgmentId,
          notes: notes || "",
          tags: tags ? JSON.stringify(tags) : null,
        },
      });
      return NextResponse.json({ isBookmarked: true, bookmark: created });
    }
  } catch (error: any) {
    console.error("Bookmarks POST error:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}
