import prisma from "./prisma";

export interface SearchFilters {
  query?: string;
  courtCode?: string; // "SCI", "HCKAR"
  benchName?: string;
  caseType?: string;
  actShortName?: string;
  sectionNumber?: string;
  legalTopic?: string;
  judgeName?: string;
  caseNumber?: string;
  citation?: string;
  partyName?: string;
  disposalNature?: string;
  dateFrom?: string; // DD-MM-YYYY or YYYY-MM-DD
  dateTo?: string; // DD-MM-YYYY or YYYY-MM-DD
  sortBy?: "relevance" | "newest" | "oldest" | "court";
  page?: number;
  pageSize?: number;
}

export interface SearchResultItem {
  id: string;
  title: string;
  court: {
    code: string;
    name: string;
  };
  benchName: string;
  benchType: string;
  caseType: string;
  caseNumber: string;
  judgmentDate: string; // ISO string
  formattedDate: string; // DD-MM-YYYY
  neutralCitation?: string | null;
  reportedCitation?: string | null;
  disposalNature?: string | null;
  authorJudge?: string | null;
  coram?: string | null;
  headnote?: string | null;
  verificationStatus: string;
  precedentialStatus: string;
  isOverruled: boolean;
  sections: Array<{
    actShortName: string;
    sectionNumber: string;
    sectionTitle: string;
    equivalenceType: string;
    correspondingSection?: string | null;
  }>;
  legalTopics: string[];
  folderCategories: string[];
  relevanceScore: number;
  snippetHtml: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  appliedFilters: SearchFilters;
  parsedQueryMetadata: {
    detectedCourt?: string;
    detectedAct?: string;
    detectedSection?: string;
    cleanKeywordQuery: string;
  };
}

// Helper to parse DD-MM-YYYY to Date
function parseIndianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }
  return null;
}

export function formatIndianDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export async function executeLegalSearch(filters: SearchFilters): Promise<SearchResponse> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(50, filters.pageSize || 10));
  const rawQuery = (filters.query || "").trim();

  // Smart Query Parsing for Advocate Queries:
  // e.g. "IPC Section 420 cheating Supreme Court"
  // e.g. "Section 438 CrPC anticipatory bail Karnataka High Court"
  // e.g. "Section 138 NI Act cheque dishonour"
  let detectedCourt: string | undefined = filters.courtCode;
  let detectedAct: string | undefined = filters.actShortName;
  let detectedSection: string | undefined = filters.sectionNumber;
  let cleanedKeywords = rawQuery;

  if (rawQuery) {
    const lowerQ = rawQuery.toLowerCase();

    // Detect Court
    if (!detectedCourt) {
      if (lowerQ.includes("supreme court") || lowerQ.includes("apex court") || lowerQ.includes("sci")) {
        detectedCourt = "SCI";
        cleanedKeywords = cleanedKeywords.replace(/supreme\s+court|apex\s+court|sci/gi, "");
      } else if (
        lowerQ.includes("karnataka high court") ||
        lowerQ.includes("karnataka hc") ||
        lowerQ.includes("hckar") ||
        lowerQ.includes("dharwad") ||
        lowerQ.includes("kalaburagi") ||
        lowerQ.includes("bengaluru")
      ) {
        detectedCourt = "HCKAR";
        cleanedKeywords = cleanedKeywords.replace(/karnataka\s+high\s+court|karnataka\s+hc|hckar/gi, "");
      }
    }

    // Detect Act & Section pattern e.g. "IPC Section 420", "Section 438 CrPC", "Section 138 NI Act", "Article 21"
    const secMatch = lowerQ.match(/(?:section|sec|s\.)\s*([0-9a-z]+(?:\([0-9a-z]+\))?)/i);
    if (secMatch && !detectedSection) {
      detectedSection = secMatch[1];
    }

    const artMatch = lowerQ.match(/article\s*([0-9a-z]+)/i);
    if (artMatch && !detectedSection) {
      detectedSection = `Article ${artMatch[1]}`;
    }

    if (!detectedAct) {
      if (lowerQ.includes("ipc") || lowerQ.includes("penal code")) {
        detectedAct = "IPC";
        cleanedKeywords = cleanedKeywords.replace(/ipc|penal\s+code/gi, "");
      } else if (lowerQ.includes("crpc") || lowerQ.includes("criminal procedure")) {
        detectedAct = "CrPC";
        cleanedKeywords = cleanedKeywords.replace(/crpc|code\s+of\s+criminal\s+procedure/gi, "");
      } else if (lowerQ.includes("bns") || lowerQ.includes("nyaya sanhita")) {
        detectedAct = "BNS";
        cleanedKeywords = cleanedKeywords.replace(/bns|nyaya\s+sanhita/gi, "");
      } else if (lowerQ.includes("bnss") || lowerQ.includes("nagarik suraksha")) {
        detectedAct = "BNSS";
        cleanedKeywords = cleanedKeywords.replace(/bnss|nagarik\s+suraksha/gi, "");
      } else if (lowerQ.includes("bsa") || lowerQ.includes("sakshya")) {
        detectedAct = "BSA";
        cleanedKeywords = cleanedKeywords.replace(/bsa|sakshya/gi, "");
      } else if (lowerQ.includes("ni act") || lowerQ.includes("cheque") || lowerQ.includes("negotiable")) {
        detectedAct = "NI Act";
        cleanedKeywords = cleanedKeywords.replace(/ni\s+act|negotiable\s+instruments\s+act/gi, "");
      } else if (lowerQ.includes("constitution")) {
        detectedAct = "Constitution";
        cleanedKeywords = cleanedKeywords.replace(/constitution(?:\s+of\s+india)?/gi, "");
      }
    }

    if (detectedSection) {
      cleanedKeywords = cleanedKeywords.replace(/(?:section|sec|s\.)\s*[0-9a-z]+(?:\([0-9a-z]+\))?/gi, "");
      cleanedKeywords = cleanedKeywords.replace(/article\s*[0-9a-z]+/gi, "");
    }

    cleanedKeywords = cleanedKeywords.replace(/\s+/g, " ").trim();
  }

  // Build Prisma where query
  const where: any = {};

  if (detectedCourt) {
    where.court = { code: detectedCourt };
  }

  if (filters.benchName) {
    where.benchName = { contains: filters.benchName };
  }

  if (filters.caseType) {
    where.caseType = { contains: filters.caseType };
  }

  if (filters.judgeName) {
    where.OR = [
      { authorJudge: { contains: filters.judgeName } },
      { coram: { contains: filters.judgeName } },
    ];
  }

  if (filters.caseNumber) {
    where.caseNumber = { contains: filters.caseNumber };
  }

  if (filters.citation) {
    where.OR = [
      { neutralCitation: { contains: filters.citation } },
      { reportedCitation: { contains: filters.citation } },
      { citations: { some: { fullCitationText: { contains: filters.citation } } } },
    ];
  }

  if (filters.partyName) {
    where.OR = [
      { petitioner: { contains: filters.partyName } },
      { respondent: { contains: filters.partyName } },
      { title: { contains: filters.partyName } },
    ];
  }

  if (filters.disposalNature) {
    where.disposalNature = { contains: filters.disposalNature };
  }

  if (filters.legalTopic) {
    where.legalTopics = { contains: filters.legalTopic };
  }

  // Date Filtering (DD-MM-YYYY support)
  const fromDate = filters.dateFrom ? parseIndianDate(filters.dateFrom) : null;
  const toDate = filters.dateTo ? parseIndianDate(filters.dateTo) : null;

  if (fromDate || toDate) {
    where.judgmentDate = {};
    if (fromDate) {
      where.judgmentDate.gte = fromDate;
    }
    if (toDate) {
      // Include the entire toDate day
      const endOfDay = new Date(toDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.judgmentDate.lte = endOfDay;
    }
  }

  // Act & Section Filtering
  if (detectedAct || detectedSection) {
    where.sections = {
      some: {
        actSection: {
          ...(detectedAct
            ? {
                act: {
                  OR: [
                    { shortName: { equals: detectedAct } },
                    { officialName: { contains: detectedAct } },
                  ],
                },
              }
            : {}),
          ...(detectedSection
            ? {
                sectionNumber: {
                  contains: detectedSection.replace(/article\s*/i, ""),
                },
              }
            : {}),
        },
      },
    };
  }

  // Text search condition
  if (cleanedKeywords) {
    const terms = cleanedKeywords.split(/\s+/).filter((t) => t.length > 1);
    if (terms.length > 0) {
      // Search across title, headnote, fullText, citations, legalTopics
      where.AND = terms.map((term) => ({
        OR: [
          { title: { contains: term } },
          { headnote: { contains: term } },
          { legalTopics: { contains: term } },
          { fullText: { contains: term } },
          { neutralCitation: { contains: term } },
          { reportedCitation: { contains: term } },
        ],
      }));
    }
  }

  // Fetch all matching judgments with relations
  const allMatches = await prisma.judgment.findMany({
    where,
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
  });

  // Calculate Relevance Scores & Snippets
  const searchTokens = (rawQuery + " " + cleanedKeywords)
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);

  const scoredResults: SearchResultItem[] = allMatches.map((j) => {
    let score = 10; // baseline

    // Direct Exact Citation Match
    if (filters.citation || rawQuery) {
      const qLower = (filters.citation || rawQuery).toLowerCase();
      if (
        j.neutralCitation?.toLowerCase().includes(qLower) ||
        j.reportedCitation?.toLowerCase().includes(qLower) ||
        j.citations.some((c) => c.fullCitationText.toLowerCase().includes(qLower))
      ) {
        score += 150;
      }
    }

    // Direct Case Number Match
    if (filters.caseNumber && j.caseNumber.toLowerCase().includes(filters.caseNumber.toLowerCase())) {
      score += 120;
    }

    // Section Match Bonus
    if (detectedSection) {
      const secMatch = j.sections.some((s) =>
        s.actSection.sectionNumber.toLowerCase().includes(detectedSection!.toLowerCase())
      );
      if (secMatch) score += 60;
    }

    // Act Match Bonus
    if (detectedAct) {
      const actMatch = j.sections.some(
        (s) =>
          s.actSection.act.shortName.toLowerCase() === detectedAct!.toLowerCase() ||
          s.actSection.act.officialName.toLowerCase().includes(detectedAct!.toLowerCase())
      );
      if (actMatch) score += 40;
    }

    // Term Frequency in Title, Headnote, Text
    for (const token of searchTokens) {
      if (j.title.toLowerCase().includes(token)) score += 30;
      if (j.headnote?.toLowerCase().includes(token)) score += 20;
      if (j.legalTopics?.toLowerCase().includes(token)) score += 15;
      if (j.fullText.toLowerCase().includes(token)) score += 5;
    }

    // Precedential Status Weight
    if (j.precedentialStatus === "BINDING_PRECEDENT") score += 10;
    if (j.isOverruled) score -= 25;

    // Generate highlighted snippet
    let snippet = j.headnote || "";
    if (!snippet && j.fullText) {
      snippet = j.fullText.slice(0, 300);
    }

    // Extract relevant window if keywords appear in full text
    if (cleanedKeywords) {
      const firstToken = searchTokens[0];
      if (firstToken) {
        const idx = j.fullText.toLowerCase().indexOf(firstToken);
        if (idx !== -1) {
          const start = Math.max(0, idx - 100);
          const end = Math.min(j.fullText.length, idx + 200);
          snippet = (start > 0 ? "... " : "") + j.fullText.slice(start, end) + (end < j.fullText.length ? " ..." : "");
        }
      }
    }

    // Safe HTML Highlighting for snippet
    let snippetHtml = snippet;
    for (const token of searchTokens) {
      if (token.length > 2) {
        const regex = new RegExp(`(${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
        snippetHtml = snippetHtml.replace(regex, `<mark class="bg-amber-100 font-semibold px-1 py-0.5 rounded text-amber-950">$1</mark>`);
      }
    }

    // Parse topics and folders
    const legalTopics: string[] = j.legalTopics ? JSON.parse(j.legalTopics) : [];
    const folderCategories: string[] = j.folderCategories ? JSON.parse(j.folderCategories) : [];

    const sections = j.sections.map((s) => ({
      actShortName: s.actSection.act.shortName,
      sectionNumber: s.actSection.sectionNumber,
      sectionTitle: s.actSection.sectionTitle,
      equivalenceType: s.actSection.equivalenceType,
      correspondingSection: s.actSection.correspondingSection,
    }));

    return {
      id: j.id,
      title: j.title,
      court: {
        code: j.court.code,
        name: j.court.name,
      },
      benchName: j.benchName,
      benchType: j.benchType,
      caseType: j.caseType,
      caseNumber: j.caseNumber,
      judgmentDate: j.judgmentDate.toISOString(),
      formattedDate: formatIndianDate(j.judgmentDate),
      neutralCitation: j.neutralCitation,
      reportedCitation: j.reportedCitation,
      disposalNature: j.disposalNature,
      authorJudge: j.authorJudge,
      coram: j.coram,
      headnote: j.headnote,
      verificationStatus: j.verificationStatus,
      precedentialStatus: j.precedentialStatus,
      isOverruled: j.isOverruled,
      sections,
      legalTopics,
      folderCategories,
      relevanceScore: score,
      snippetHtml,
    };
  });

  // Sorting
  const sortBy = filters.sortBy || "relevance";
  if (sortBy === "relevance") {
    scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } else if (sortBy === "newest") {
    scoredResults.sort((a, b) => new Date(b.judgmentDate).getTime() - new Date(a.judgmentDate).getTime());
  } else if (sortBy === "oldest") {
    scoredResults.sort((a, b) => new Date(a.judgmentDate).getTime() - new Date(b.judgmentDate).getTime());
  } else if (sortBy === "court") {
    scoredResults.sort((a, b) => {
      if (a.court.code === "SCI" && b.court.code !== "SCI") return -1;
      if (a.court.code !== "SCI" && b.court.code === "SCI") return 1;
      return new Date(b.judgmentDate).getTime() - new Date(a.judgmentDate).getTime();
    });
  }

  // Pagination
  const totalCount = scoredResults.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedResults = scoredResults.slice((page - 1) * pageSize, page * pageSize);

  return {
    results: paginatedResults,
    totalCount,
    page,
    pageSize,
    totalPages,
    appliedFilters: filters,
    parsedQueryMetadata: {
      detectedCourt,
      detectedAct,
      detectedSection,
      cleanKeywordQuery: cleanedKeywords,
    },
  };
}
