import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connectors = await prisma.sourceConnector.findMany({
      include: {
        court: true,
      },
    });

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const ingestionJobs = await prisma.ingestionJob.findMany({
      take: 10,
      orderBy: { startedAt: "desc" },
    });

    const stats = {
      totalJudgments: await prisma.judgment.count(),
      verifiedJudgments: await prisma.judgment.count({ where: { verificationStatus: "VERIFIED" } }),
      supremeCourtCount: await prisma.judgment.count({ where: { court: { code: "SCI" } } }),
      karnatakaHighCourtCount: await prisma.judgment.count({ where: { court: { code: "HCKAR" } } }),
      totalActs: await prisma.act.count(),
      totalSections: await prisma.actSection.count(),
    };

    return NextResponse.json({
      connectors,
      recentAuditLogs,
      ingestionJobs,
      stats,
    });
  } catch (error: any) {
    console.error("Admin connectors error:", error);
    return NextResponse.json({ error: "Failed to fetch connector status" }, { status: 500 });
  }
}
