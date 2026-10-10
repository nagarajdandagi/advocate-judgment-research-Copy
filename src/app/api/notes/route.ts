import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const judgmentId = searchParams.get("judgmentId");

    const notes = await prisma.personalNote.findMany({
      where: {
        userId: user.id,
        ...(judgmentId ? { judgmentId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error("Notes GET error:", error);
    return NextResponse.json({ error: "Failed to fetch personal notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { judgmentId, paragraphIndex, content } = await req.json();
    if (!judgmentId || !content?.trim()) {
      return NextResponse.json({ error: "Judgment ID and note content are required" }, { status: 400 });
    }

    const note = await prisma.personalNote.create({
      data: {
        userId: user.id,
        judgmentId,
        paragraphIndex: paragraphIndex !== undefined ? parseInt(paragraphIndex, 10) : null,
        content: content.trim(),
        isPrivate: true,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error("Notes POST error:", error);
    return NextResponse.json({ error: "Failed to create personal note" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    // Ensure note belongs to current user
    const note = await prisma.personalNote.findFirst({
      where: { id, userId: user.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 });
    }

    await prisma.personalNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Note deleted" });
  } catch (error: any) {
    console.error("Notes DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
