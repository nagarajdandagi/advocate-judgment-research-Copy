import { NextResponse } from "next/server";
import { executeLegalSearch, SearchFilters } from "@/lib/search-engine";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filters: SearchFilters = {
      query: searchParams.get("q") || undefined,
      courtCode: searchParams.get("court") || undefined,
      benchName: searchParams.get("bench") || undefined,
      caseType: searchParams.get("caseType") || undefined,
      actShortName: searchParams.get("act") || undefined,
      sectionNumber: searchParams.get("section") || undefined,
      legalTopic: searchParams.get("topic") || undefined,
      judgeName: searchParams.get("judge") || undefined,
      caseNumber: searchParams.get("caseNo") || undefined,
      citation: searchParams.get("citation") || undefined,
      partyName: searchParams.get("party") || undefined,
      disposalNature: searchParams.get("outcome") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "relevance",
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : 10,
    };

    const results = await executeLegalSearch(filters);

    // Save search history if authenticated
    const user = await getCurrentUser();
    if (user && filters.query) {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          queryText: filters.query,
          filtersJson: JSON.stringify(filters),
          resultCount: results.totalCount,
        },
      }).catch((e) => console.error("Search history log error:", e));
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to execute search query" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const filters: SearchFilters = await req.json();
    const results = await executeLegalSearch(filters);

    const user = await getCurrentUser();
    if (user && filters.query) {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          queryText: filters.query,
          filtersJson: JSON.stringify(filters),
          resultCount: results.totalCount,
        },
      }).catch((e) => console.error("Search history log error:", e));
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Search POST API error:", error);
    return NextResponse.json(
      { error: "Failed to execute search query" },
      { status: 500 }
    );
  }
}
