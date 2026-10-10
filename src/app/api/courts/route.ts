import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const courts = await prisma.court.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { judgments: true },
        },
      },
      orderBy: { hierarchyLevel: "asc" },
    });

    const courtsWithFolders = await Promise.all(
      courts.map(async (c) => {
        const benches = c.benches ? JSON.parse(c.benches) : [];

        // Define data-driven folder hierarchy for each court
        let categories: Array<{ id: string; name: string; count: number; filterType: string; filterValue: string }> = [];

        if (c.code === "SCI") {
          categories = [
            { id: "crim", name: "Criminal Matters", count: 0, filterType: "folder", filterValue: "Criminal Matters" },
            { id: "civ", name: "Civil Matters", count: 0, filterType: "folder", filterValue: "Civil Matters" },
            { id: "const", name: "Constitutional Matters", count: 0, filterType: "folder", filterValue: "Constitutional Matters" },
            { id: "writs", name: "Writ Petitions", count: 0, filterType: "caseType", filterValue: "Writ Petition" },
            { id: "slp", name: "Special Leave Petitions", count: 0, filterType: "caseType", filterValue: "Special Leave Petition" },
            { id: "bail", name: "Bail and Anticipatory Bail", count: 0, filterType: "folder", filterValue: "Bail and Anticipatory Bail" },
          ];
        } else if (c.code === "HCKAR") {
          categories = [
            { id: "crim", name: "Criminal Matters", count: 0, filterType: "folder", filterValue: "Criminal Matters" },
            { id: "civ", name: "Civil Matters", count: 0, filterType: "folder", filterValue: "Civil Matters" },
            { id: "const", name: "Constitutional Matters", count: 0, filterType: "folder", filterValue: "Constitutional Matters" },
            { id: "writs", name: "Writ Petitions", count: 0, filterType: "caseType", filterValue: "Writ Petition" },
            { id: "bail", name: "Bail and Anticipatory Bail", count: 0, filterType: "folder", filterValue: "Bail and Anticipatory Bail" },
            { id: "app_rev", name: "Appeals and Revisions", count: 0, filterType: "folder", filterValue: "Appeals and Revisions" },
            { id: "bench_blr", name: "Principal Bench, Bengaluru", count: 0, filterType: "bench", filterValue: "Bengaluru" },
            { id: "bench_dwr", name: "Dharwad Bench", count: 0, filterType: "bench", filterValue: "Dharwad" },
            { id: "bench_klb", name: "Kalaburagi Bench", count: 0, filterType: "bench", filterValue: "Kalaburagi" },
          ];
        }

        // Compute counts dynamically
        for (const cat of categories) {
          let count = 0;
          if (cat.filterType === "folder") {
            count = await prisma.judgment.count({
              where: {
                courtId: c.id,
                folderCategories: { contains: cat.filterValue },
              },
            });
          } else if (cat.filterType === "caseType") {
            count = await prisma.judgment.count({
              where: {
                courtId: c.id,
                caseType: { contains: cat.filterValue },
              },
            });
          } else if (cat.filterType === "bench") {
            count = await prisma.judgment.count({
              where: {
                courtId: c.id,
                benchName: { contains: cat.filterValue },
              },
            });
          }
          cat.count = count;
        }

        return {
          id: c.id,
          code: c.code,
          name: c.name,
          jurisdiction: c.jurisdiction,
          state: c.state,
          hierarchyLevel: c.hierarchyLevel,
          websiteUrl: c.websiteUrl,
          benches,
          totalJudgments: c._count.judgments,
          categories,
        };
      })
    );

    return NextResponse.json({ courts: courtsWithFolders });
  } catch (error: any) {
    console.error("Courts API error:", error);
    return NextResponse.json({ error: "Failed to load courts" }, { status: 500 });
  }
}
