"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  Building2,
  Scale,
  Copy,
  Check,
  Columns,
  Bookmark,
  ArrowUpDown,
  BookOpen,
  Hash,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { SearchResultItem, SearchFilters } from "@/lib/search-engine";

interface SearchResultsViewProps {
  results: SearchResultItem[];
  totalCount: number;
  parsedQueryMetadata?: any;
  currentFilters: SearchFilters;
  onFilterChange: (newFilters: SearchFilters) => void;
  onOpenJudgment: (id: string) => void;
  onToggleCompare: (judgment: SearchResultItem) => void;
  selectedForCompare: SearchResultItem[];
  onBookmark: (judgmentId: string) => void;
  bookmarkedIds: Set<string>;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  results,
  totalCount,
  parsedQueryMetadata,
  currentFilters,
  onFilterChange,
  onOpenJudgment,
  onToggleCompare,
  selectedForCompare,
  onBookmark,
  bookmarkedIds,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCitation = (j: SearchResultItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const citationText = j.reportedCitation || j.neutralCitation || `${j.title}, ${j.caseNumber} (${j.formattedDate})`;
    navigator.clipboard.writeText(citationText);
    setCopiedId(j.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFilterUpdate = (key: keyof SearchFilters, value: any) => {
    onFilterChange({
      ...currentFilters,
      [key]: value || undefined,
      page: 1,
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Search Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span>Legal Search Query:</span>
            {currentFilters.query ? (
              <span className="font-semibold text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded">
                &ldquo;{currentFilters.query}&rdquo;
              </span>
            ) : (
              <span className="italic">All Indexed Judgments</span>
            )}
          </div>
          <div className="text-sm font-bold text-slate-900 font-serif">
            Found <span className="text-amber-800">{totalCount}</span> verified judicial records
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-600">Sort by:</span>
          <select
            value={currentFilters.sortBy || "relevance"}
            onChange={(e) => handleFilterUpdate("sortBy", e.target.value)}
            className="text-xs p-1.5 rounded border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-amber-600"
          >
            <option value="relevance">Most Relevant First</option>
            <option value="newest">Newest Judgment (Date Desc)</option>
            <option value="oldest">Oldest Precedent (Date Asc)</option>
            <option value="court">Apex Court First (Supreme Court)</option>
          </select>
        </div>
      </div>

      {/* Query Parser Badges (Section 7) */}
      {parsedQueryMetadata && (parsedQueryMetadata.detectedCourt || parsedQueryMetadata.detectedAct || parsedQueryMetadata.detectedSection) && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs flex flex-wrap items-center gap-2 text-amber-950">
          <span className="font-semibold">Query Interpretation:</span>
          {parsedQueryMetadata.detectedCourt && (
            <span className="px-2 py-0.5 rounded bg-amber-100 font-mono text-[11px] font-bold border border-amber-300">
              Court: {parsedQueryMetadata.detectedCourt === "SCI" ? "Supreme Court of India" : "High Court of Karnataka"}
            </span>
          )}
          {parsedQueryMetadata.detectedAct && (
            <span className="px-2 py-0.5 rounded bg-amber-100 font-mono text-[11px] font-bold border border-amber-300">
              Act: {parsedQueryMetadata.detectedAct}
            </span>
          )}
          {parsedQueryMetadata.detectedSection && (
            <span className="px-2 py-0.5 rounded bg-amber-100 font-mono text-[11px] font-bold border border-amber-300">
              Section: {parsedQueryMetadata.detectedSection}
            </span>
          )}
          {parsedQueryMetadata.cleanKeywordQuery && (
            <span className="text-slate-600">
              Keywords: &ldquo;{parsedQueryMetadata.cleanKeywordQuery}&rdquo;
            </span>
          )}
        </div>
      )}

      {/* Results Layout: Left Filters (1 Col) + Right Results (3 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Filters Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-fit space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-700" />
              <span>Refine Results</span>
            </span>
            <button
              onClick={() => onFilterChange({ page: 1, pageSize: 10 })}
              className="text-[11px] text-amber-800 hover:underline font-medium"
            >
              Reset
            </button>
          </div>

          {/* Court Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Court
            </label>
            <select
              value={currentFilters.courtCode || ""}
              onChange={(e) => handleFilterUpdate("courtCode", e.target.value)}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
            >
              <option value="">All Courts</option>
              <option value="SCI">Supreme Court of India</option>
              <option value="HCKAR">High Court of Karnataka</option>
            </select>
          </div>

          {/* Case Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Case Classification
            </label>
            <select
              value={currentFilters.caseType || ""}
              onChange={(e) => handleFilterUpdate("caseType", e.target.value)}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
            >
              <option value="">All Classifications</option>
              <option value="Criminal Appeal">Criminal Appeal</option>
              <option value="Criminal Petition">Criminal Petition (High Court)</option>
              <option value="Special Leave Petition">Special Leave Petition (SLP)</option>
              <option value="Writ Petition">Writ Petition</option>
              <option value="Civil Appeal">Civil Appeal</option>
            </select>
          </div>

          {/* Act Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Statute (Act)
            </label>
            <select
              value={currentFilters.actShortName || ""}
              onChange={(e) => handleFilterUpdate("actShortName", e.target.value)}
              className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
            >
              <option value="">All Statutes</option>
              <option value="IPC">Indian Penal Code, 1860</option>
              <option value="CrPC">Code of Criminal Procedure, 1973</option>
              <option value="BNS">Bharatiya Nyaya Sanhita, 2023</option>
              <option value="BNSS">Bharatiya Nagarik Suraksha Sanhita, 2023</option>
              <option value="NI Act">Negotiable Instruments Act, 1881</option>
              <option value="Constitution">Constitution of India</option>
            </select>
          </div>

          {/* Section Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Section Number
            </label>
            <input
              type="text"
              value={currentFilters.sectionNumber || ""}
              onChange={(e) => handleFilterUpdate("sectionNumber", e.target.value)}
              placeholder="e.g. 420, 438, 138"
              className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
            />
          </div>

          {/* Date Filter (DD-MM-YYYY) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Date (DD-MM-YYYY)
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={currentFilters.dateFrom || ""}
                onChange={(e) => handleFilterUpdate("dateFrom", e.target.value)}
                placeholder="From: 01-01-2014"
                className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
              />
              <input
                type="text"
                value={currentFilters.dateTo || ""}
                onChange={(e) => handleFilterUpdate("dateTo", e.target.value)}
                placeholder="To: 31-12-2024"
                className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Search Results List (3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          {results.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Search className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 font-serif">
                No judgments matched your legal criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try widening your date boundaries, searching by statutory section number (e.g. &ldquo;420&rdquo; or &ldquo;438&rdquo;), or checking spelling in party names.
              </p>
            </div>
          ) : (
            results.map((j) => {
              const isCompared = selectedForCompare.some((item) => item.id === j.id);
              const isBookmarked = bookmarkedIds.has(j.id);

              return (
                <div
                  key={j.id}
                  onClick={() => onOpenJudgment(j.id)}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-amber-600/60 transition-all cursor-pointer group space-y-3"
                >
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          j.court.code === "SCI"
                            ? "bg-amber-100 text-amber-950 border border-amber-200"
                            : "bg-blue-100 text-blue-950 border border-blue-200"
                        }`}
                      >
                        {j.court.name}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-600">
                        {j.formattedDate}
                      </span>
                      {j.neutralCitation && (
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {j.neutralCitation}
                        </span>
                      )}
                      {j.reportedCitation && (
                        <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                          {j.reportedCitation}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* Copy Citation Button */}
                      <button
                        onClick={(e) => copyCitation(j, e)}
                        title="Copy Official Indian Citation"
                        className="p-1.5 rounded text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1 border border-slate-200 transition-colors"
                      >
                        {copiedId === j.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px] text-emerald-700 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">Copy Citation</span>
                          </>
                        )}
                      </button>

                      {/* Add to Compare Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCompare(j);
                        }}
                        title="Compare Side-by-Side"
                        className={`p-1.5 rounded text-xs flex items-center space-x-1 border transition-colors ${
                          isCompared
                            ? "bg-blue-100 text-blue-900 border-blue-300 font-semibold"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <Columns className="w-3.5 h-3.5" />
                        <span className="text-[10px] hidden sm:inline">
                          {isCompared ? "Compared" : "Compare"}
                        </span>
                      </button>

                      {/* Bookmark Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookmark(j.id);
                        }}
                        title="Bookmark Judgment"
                        className={`p-1.5 rounded text-xs border transition-colors ${
                          isBookmarked
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "text-slate-500 hover:text-amber-800 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Case Title & Bench */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-serif">
                      {j.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{j.benchName}</span>
                      <span>&bull;</span>
                      <span className="font-semibold text-slate-700">{j.caseNumber}</span>
                      {j.authorJudge && (
                        <>
                          <span>&bull;</span>
                          <span>Author: {j.authorJudge}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Highlighted Snippet (Section 7) */}
                  <div
                    className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100 font-serif"
                    dangerouslySetInnerHTML={{ __html: j.snippetHtml }}
                  />

                  {/* Sections Badges & Precedential Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {j.sections?.map((sec, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {sec.actShortName} Sec. {sec.sectionNumber}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          j.precedentialStatus === "BINDING_PRECEDENT"
                            ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                            : "bg-amber-100 text-amber-950 border border-amber-300"
                        }`}
                      >
                        {j.precedentialStatus.replace("_", " ")}
                      </span>
                      {j.isOverruled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300">
                          OVERRULED / SUPERSEDED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
