import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN" && user.role !== "SENIOR_ADVOCATE") {
      return NextResponse.json({ error: "Admin or Senior Advocate privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      courtCode,
      benchName,
      benchType,
      caseType,
      caseNumber,
      judgmentDate,
      neutralCitation,
      reportedCitation,
      disposalNature,
      authorJudge,
      coram,
      headnote,
      fullText,
      sourceUrl,
      actSectionIds, // array of actSectionId strings
      fileName,
    } = body;

    if (!title || !courtCode || !fullText || !caseNumber || !judgmentDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, courtCode, fullText, caseNumber, judgmentDate" },
        { status: 400 }
      );
    }

    // 1. Compute SHA256 Checksum to identify duplicates
    const checksumSha256 = crypto
      .createHash("sha256")
      .update(fullText.trim())
      .digest("hex");

    // Check for existing duplicate document or judgment
    const existingDuplicate = await prisma.judgment.findFirst({
      where: {
        OR: [
          { documentChecksum: checksumSha256 },
          { neutralCitation: neutralCitation || "NON_EXISTENT_CITATION_MATCH" },
          { AND: [{ court: { code: courtCode } }, { caseNumber }] },
        ],
      },
      include: {
        court: true,
      },
    });

    if (existingDuplicate) {
      return NextResponse.json(
        {
          error: "Duplicate judgment detected",
          duplicateFound: true,
          existingJudgmentId: existingDuplicate.id,
          existingTitle: existingDuplicate.title,
          existingCaseNumber: existingDuplicate.caseNumber,
          matchedOn:
            existingDuplicate.documentChecksum === checksumSha256
              ? "Content Checksum (Identical Document Body)"
              : existingDuplicate.neutralCitation === neutralCitation
              ? "Neutral Citation"
              : "Court & Case Number",
        },
        { status: 409 }
      );
    }

    // 2. Resolve Court
    const court = await prisma.court.findUnique({
      where: { code: courtCode },
    });
    if (!court) {
      return NextResponse.json({ error: `Court with code ${courtCode} not found` }, { status: 404 });
    }

    // 3. Estimate paragraph count
    const paraMatches = fullText.match(/\[\d+\]/g);
    const paragraphCount = paraMatches ? paraMatches.length : fullText.split(/\n\s*\n/).length;

    // 4. Create Judgment
    const newJudgment = await prisma.judgment.create({
      data: {
        courtId: court.id,
        benchName: benchName || (courtCode === "SCI" ? "Principal Bench, New Delhi" : "Principal Bench, Bengaluru"),
        benchType: benchType || "Division Bench",
        title: title.trim(),
        caseType: caseType || "Criminal Appeal",
        caseNumber: caseNumber.trim(),
        judgmentDate: new Date(judgmentDate),
        disposalNature: disposalNature || "Disposed of",
        authorJudge: authorJudge || null,
        coram: coram || null,
        neutralCitation: neutralCitation ? neutralCitation.trim() : null,
        reportedCitation: reportedCitation ? reportedCitation.trim() : null,
        headnote: headnote || null,
        fullText: fullText.trim(),
        paragraphCount: Math.max(1, paragraphCount),
        sourceUrl: sourceUrl || null,
        verificationStatus: "VERIFIED",
        documentChecksum: checksumSha256,
        isOverruled: false,
        precedentialStatus: courtCode === "SCI" ? "BINDING_PRECEDENT" : "BINDING_PRECEDENT",
        folderCategories: JSON.stringify(["Criminal Matters", "Judicial Imports"]),
      },
    });

    // 5. Create Document Record
    await prisma.judgmentDocument.create({
      data: {
        judgmentId: newJudgment.id,
        fileName: fileName || `${caseNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        fileType: "application/pdf",
        fileSize: Buffer.byteLength(fullText, "utf8"),
        rawText: fullText.trim(),
        ocrPerformed: false,
        extractionStatus: "COMPLETED",
        checksumSha256,
        isOriginal: true,
      },
    });

    // 6. Link Acts & Sections if provided
    if (Array.isArray(actSectionIds) && actSectionIds.length > 0) {
      for (const actSectionId of actSectionIds) {
        await prisma.judgmentSection.create({
          data: {
            judgmentId: newJudgment.id,
            actSectionId,
            isPrimary: true,
          },
        }).catch((e) => console.error("Error linking section:", e));
      }
    }

    // 7. Create Primary Citation if provided
    if (reportedCitation || neutralCitation) {
      await prisma.citation.create({
        data: {
          judgmentId: newJudgment.id,
          reporter: courtCode === "SCI" ? "INSC" : "KHC",
          year: new Date(judgmentDate).getFullYear(),
          fullCitationText: (reportedCitation || neutralCitation)!,
          isPrimary: true,
        },
      });
    }

    // 8. Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "IMPORT_JUDGMENT",
        entityType: "JUDGMENT",
        entityId: newJudgment.id,
        detailsJson: JSON.stringify({
          title: newJudgment.title,
          courtCode,
          checksum: checksumSha256,
          sectionsCount: actSectionIds?.length || 0,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Judgment verified and ingested successfully into law library",
      judgmentId: newJudgment.id,
      checksumSha256,
    });
  } catch (error: any) {
    console.error("Admin import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import judgment" },
      { status: 500 }
    );
  }
}
