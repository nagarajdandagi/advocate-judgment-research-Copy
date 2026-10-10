"use client";

import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  ChevronRight,
  FileText,
  Building2,
  Filter,
  Search,
  Scale,
  Calendar,
  ExternalLink,
  Layers,
} from "lucide-react";
import { Court, JudgmentSummary } from "@/lib/types";

interface CourtExplorerViewProps {
  courtCode: string; // "SCI" or "HCKAR"
  initialBench?: string;
  onOpenJudgment: (id: string) => void;
  setActiveView: (view: string) => void;
}

export const CourtExplorerView: React.FC<CourtExplorerViewProps> = ({
  courtCode,
  initialBench,
  onOpenJudgment,
  setActiveView,
}) => {
  const [courtData, setCourtData] = useState<Court | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedFolderName, setSelectedFolderName] = useState<string>("All Judgments");
  const [judgments, setJudgments] = useState<JudgmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    async function loadCourtAndJudgments() {
      setLoading(true);
      try {
        const resCourts = await fetch("/api/courts");
        const jsonCourts = await resCourts.json();
        const found = jsonCourts.courts.find((c: Court) => c.code === courtCode);
        setCourtData(found);

        // Fetch judgments for this court
        const resJudgments = await fetch(
          `/api/search?court=${courtCode}&pageSize=50${initialBench ? `&bench=${initialBench}` : ""}`
        );
        const jsonJudgments = await resJudgments.json();
        setJudgments(jsonJudgments.results || []);

        if (initialBench) {
          setSelectedFolderName(`${initialBench} Bench`);
        }
      } catch (err) {
        console.error("Failed to load court explorer:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourtAndJudgments();
  }, [courtCode, initialBench]);

  const handleSelectFolder = async (category: any) => {
    setSelectedFolder(category.id);
    setSelectedFolderName(category.name);
    setLoading(true);

    try {
      let url = `/api/search?court=${courtCode}&pageSize=50`;
      if (category.filterType === "folder") {
        url += `&q=${encodeURIComponent(category.filterValue)}`;
      } else if (category.filterType === "caseType") {
        url += `&caseType=${encodeURIComponent(category.filterValue)}`;
      } else if (category.filterType === "bench") {
        url += `&bench=${encodeURIComponent(category.filterValue)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setJudgments(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredJudgments = judgments.filter(
    (j) =>
      j.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      j.caseNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (j.neutralCitation && j.neutralCitation.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (j.headnote && j.headnote.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveView("dashboard")}
          className="hover:text-amber-800 font-medium"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">
          {courtData ? courtData.name : courtCode === "SCI" ? "Supreme Court of India" : "High Court of Karnataka"}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-amber-800 font-semibold">{selectedFolderName}</span>
      </div>

      {/* Court Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-xl font-bold shadow-sm ${
              courtCode === "SCI"
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "bg-blue-100 text-blue-900 border border-blue-300"
            }`}
          >
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 font-serif">
              {courtData?.name || "Court Jurisprudence Explorer"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {courtData?.jurisdiction} &bull; Official Digital Archives & Bench Classifications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {courtData?.websiteUrl && (
            <a
              href={courtData.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <span>Official Court Portal</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      {/* Explorer Grid: Left Desktop Folder Tree + Right Files Table */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop File Explorer Folder Tree (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-fit space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>Court Folders</span>
            </span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setSelectedFolder("all");
                setSelectedFolderName("All Judgments");
                setLoading(true);
                fetch(`/api/search?court=${courtCode}&pageSize=50`)
                  .then((r) => r.json())
                  .then((d) => setJudgments(d.results || []))
                  .finally(() => setLoading(false));
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                selectedFolder === "all"
                  ? "bg-amber-100/70 text-amber-900 font-bold border border-amber-300"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                {selectedFolder === "all" ? (
                  <FolderOpen className="w-4 h-4 text-amber-700" />
                ) : (
                  <Folder className="w-4 h-4 text-slate-400" />
                )}
                <span>All Judgments</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {courtData?.totalJudgments || judgments.length}
              </span>
            </button>

            {courtData?.categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectFolder(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  selectedFolder === cat.id
                    ? "bg-amber-100/70 text-amber-900 font-bold border border-amber-300"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2 truncate pr-2">
                  {selectedFolder === cat.id ? (
                    <FolderOpen className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 flex-shrink-0">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Judgments List (3 Cols) */}
        <div className="md:col-span-3 space-y-3">
          {/* Internal Search & Result Counter */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Search within ${selectedFolderName}...`}
                className="w-full text-xs pl-9 pr-3 py-2 rounded border border-slate-200 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredJudgments.length}</span>{" "}
              records
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <div className="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">
                Loading court records and verified judgment data...
              </p>
            </div>
          ) : filteredJudgments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 font-serif">No records found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No judgments matched the selected folder filter. Try selecting another folder or clearing internal search.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {filteredJudgments.map((j) => (
                <div
                  key={j.id}
                  onClick={() => onOpenJudgment(j.id)}
                  className="p-4 hover:bg-slate-50/90 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-mono text-slate-500 font-semibold">
                          {j.formattedDate}
                        </span>
                        {j.neutralCitation && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 font-mono text-[10px] border border-slate-200">
                            {j.neutralCitation}
                          </span>
                        )}
                        {j.reportedCitation && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 font-mono text-[10px] border border-amber-200">
                            {j.reportedCitation}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {j.benchName}
                        </span>
                      </div>

                      <h2 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-serif">
                        {j.title}
                      </h2>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {j.headnote || "Verified court judgment with structured advocate's brief and original document text."}
                      </p>

                      {j.sections && j.sections.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {j.sections.map((sec, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {sec.actShortName} Sec. {sec.sectionNumber}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {j.caseType}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 block mt-1">
                        {j.caseNumber}
                      </span>
                      <span className="inline-block mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        VERIFIED RECORD
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
