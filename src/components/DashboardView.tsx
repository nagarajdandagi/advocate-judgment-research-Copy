"use client";

import React from "react";
import {
  Building2,
  BookOpen,
  Calendar,
  Hash,
  Bookmark,
  FolderCheck,
  Search,
  Scale,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { JudgmentSummary } from "@/lib/types";

interface DashboardViewProps {
  onSearch: (query: string, filters?: any) => void;
  onOpenJudgment: (id: string) => void;
  onSelectCourt: (courtCode: string) => void;
  onSelectAct: (actShortName: string) => void;
  setActiveView: (view: string) => void;
  recentJudgments: JudgmentSummary[];
  bookmarks: any[];
  folders: any[];
  history: any[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSearch,
  onOpenJudgment,
  onSelectCourt,
  onSelectAct,
  setActiveView,
  recentJudgments,
  bookmarks,
  folders,
  history,
}) => {
  const [quickCitation, setQuickCitation] = React.useState("");
  const [quickCaseNo, setQuickCaseNo] = React.useState("");
  const [quickDateFrom, setQuickDateFrom] = React.useState("");
  const [quickDateTo, setQuickDateTo] = React.useState("");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Subtitle Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRACTICING ADVOCATES LIBRARY
              </span>
              <span className="inline-flex items-center text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                Verified Legal Sources
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
              ADVOCATE JUDGMENT RESEARCH
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-serif">
              Supreme Court of India | High Court of Karnataka
            </p>
          </div>
          <div className="text-xs text-slate-400 max-w-sm bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
            <span className="font-semibold text-slate-200">Production Jurisprudence Core:</span>{" "}
            Section-wise retrieval, BNS/BNSS transitional law handling, 19-point advocate briefs, and private case dossiers.
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-6">
          <GlobalSearchBar onSearch={onSearch} />
        </div>
      </div>

      {/* Primary Court & Act Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supreme Court of India Card */}
        <div
          onClick={() => {
            onSelectCourt("SCI");
            setActiveView("court_sci");
          }}
          className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-600/70 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber-100/70 text-amber-900 flex items-center justify-center font-serif font-bold text-lg border border-amber-200">
              <Building2 className="w-5 h-5 text-amber-800" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-3 font-serif">
            Supreme Court of India
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Apex Court judgments, Constitution Benches, Criminal Appeals, SLPs, and Article 21 jurisprudence.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-medium text-amber-900">Explore Court Folders</span>
            <span className="font-mono text-slate-500 font-semibold">Tilak Marg, New Delhi</span>
          </div>
        </div>

        {/* High Court of Karnataka Card */}
        <div
          onClick={() => {
            onSelectCourt("HCKAR");
            setActiveView("court_hckar");
          }}
          className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-600/70 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-100/70 text-blue-900 flex items-center justify-center font-serif font-bold text-lg border border-blue-200">
              <Building2 className="w-5 h-5 text-blue-800" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-3 font-serif">
            High Court of Karnataka
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Bengaluru Principal Bench, Dharwad Bench, and Kalaburagi Bench. Bail, 482 quashing, and civil revisions.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-medium text-blue-900">3 Regional Benches</span>
            <span className="font-mono text-slate-500 font-semibold">Bengaluru &bull; Dharwad &bull; Kalaburagi</span>
          </div>
        </div>

        {/* Act and Section Browser Card */}
        <div
          onClick={() => setActiveView("acts")}
          className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-600/70 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-emerald-100/70 text-emerald-900 flex items-center justify-center font-serif font-bold text-lg border border-emerald-200">
              <BookOpen className="w-5 h-5 text-emerald-800" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-3 font-serif">
            Browse by Act & Section
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            IPC, CrPC, Evidence Act, BNS, BNSS, BSA, NI Act, Constitution. Chapter-wise & Section-wise index.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-medium text-emerald-900">Historical & Current Laws</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-semibold">
              Post-1 July 2024 Mappings
            </span>
          </div>
        </div>
      </div>

      {/* Direct Search Widgets: Citation, Case Number, Date Range */}
      <div className="bg-slate-100/70 rounded-xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search by Citation */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 mb-2">
            <Hash className="w-3.5 h-3.5 text-amber-700" />
            <span>Search by Citation</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={quickCitation}
              onChange={(e) => setQuickCitation(e.target.value)}
              placeholder="e.g. (2014) 8 SCC 273 or 2014 INSC 493"
              className="flex-1 text-xs p-2 rounded border border-slate-300 font-mono focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={() => {
                if (quickCitation.trim()) {
                  onSearch("", { citation: quickCitation.trim() });
                }
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
            >
              Go
            </button>
          </div>
        </div>

        {/* Search by Case Number */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 mb-2">
            <Scale className="w-3.5 h-3.5 text-blue-700" />
            <span>Search by Case Number</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={quickCaseNo}
              onChange={(e) => setQuickCaseNo(e.target.value)}
              placeholder="e.g. Criminal Appeal No. 1277 of 2014"
              className="flex-1 text-xs p-2 rounded border border-slate-300 font-mono focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={() => {
                if (quickCaseNo.trim()) {
                  onSearch("", { caseNo: quickCaseNo.trim() });
                }
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
            >
              Go
            </button>
          </div>
        </div>

        {/* Search by Date Range */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 mb-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>Search by Judgment Date (DD-MM-YYYY)</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={quickDateFrom}
              onChange={(e) => setQuickDateFrom(e.target.value)}
              placeholder="01-01-2020"
              className="w-1/2 text-xs p-2 rounded border border-slate-300 font-mono focus:outline-none focus:border-emerald-600"
            />
            <input
              type="text"
              value={quickDateTo}
              onChange={(e) => setQuickDateTo(e.target.value)}
              placeholder="31-12-2024"
              className="w-1/2 text-xs p-2 rounded border border-slate-300 font-mono focus:outline-none focus:border-emerald-600"
            />
            <button
              onClick={() => {
                if (quickDateFrom || quickDateTo) {
                  onSearch("", { dateFrom: quickDateFrom, dateTo: quickDateTo });
                }
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Judgments Table vs Advocate Private Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Judgments (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Recent Landmark & Authoritative Judgments
              </h2>
              <p className="text-xs text-slate-500">
                Verified records from Supreme Court of India and High Court of Karnataka
              </p>
            </div>
            <button
              onClick={() => onSearch("")}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900"
            >
              View Full Library &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentJudgments.slice(0, 6).map((judgment) => (
              <div
                key={judgment.id}
                onClick={() => onOpenJudgment(judgment.id)}
                className="py-3.5 hover:bg-slate-50/80 rounded-lg px-2.5 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          judgment.court.code === "SCI"
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-blue-100 text-blue-900 border border-blue-200"
                        }`}
                      >
                        {judgment.court.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {judgment.formattedDate}
                      </span>
                      {judgment.neutralCitation && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {judgment.neutralCitation}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-serif">
                      {judgment.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {judgment.headnote || "Official judgment record with numbered paragraphs and structured legal brief."}
                    </p>

                    {/* Section Badges */}
                    {judgment.sections && judgment.sections.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {judgment.sections.slice(0, 3).map((sec, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                          >
                            {sec.actShortName} Sec. {sec.sectionNumber}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {judgment.benchType}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 block mt-1">
                      {judgment.caseNumber}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Advocate Research Folders, Bookmarks & Recent Searches */}
        <div className="space-y-4">
          {/* Research Folders */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-1.5">
                <FolderCheck className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Case Research Folders
                </h3>
              </div>
              <button
                onClick={() => setActiveView("folders")}
                className="text-[11px] font-semibold text-blue-700 hover:underline"
              >
                Manage
              </button>
            </div>

            {folders.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No research folders yet. Create folders to organize briefs and authorities.
              </p>
            ) : (
              <div className="space-y-2">
                {folders.slice(0, 4).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setActiveView("folders")}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-slate-900">{f.name}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{f.itemCount} judgments</span>
                      {f.clientReference && (
                        <span className="truncate max-w-[120px] font-mono text-[10px]">
                          {f.clientReference}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked Judgments */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-1.5">
                <Bookmark className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Saved Bookmarks
                </h3>
              </div>
              <button
                onClick={() => setActiveView("bookmarks")}
                className="text-[11px] font-semibold text-amber-800 hover:underline"
              >
                View all ({bookmarks.length})
              </button>
            </div>

            {bookmarks.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Click bookmark icon in any judgment workspace to save here.
              </p>
            ) : (
              <div className="space-y-2">
                {bookmarks.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onOpenJudgment(b.judgmentId)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-slate-900 line-clamp-1 font-serif">
                      {b.judgment.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span className="font-mono text-[10px]">
                        {b.judgment.neutralCitation || b.judgment.formattedDate}
                      </span>
                      <span className="text-[10px] text-amber-800 font-medium">
                        {b.judgment.court.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Searched Legal Issues */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center space-x-1.5 mb-2 pb-2 border-b border-slate-100">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Recent Searches
              </h3>
            </div>
            <div className="space-y-1.5">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No recent search history.</p>
              ) : (
                history.slice(0, 4).map((h, i) => (
                  <button
                    key={i}
                    onClick={() => onSearch(h.queryText)}
                    className="w-full text-left text-xs text-slate-700 hover:text-amber-800 hover:bg-slate-50 p-1.5 rounded truncate flex items-center justify-between"
                  >
                    <span className="truncate">{h.queryText}</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-2">
                      {h.resultCount} results
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
