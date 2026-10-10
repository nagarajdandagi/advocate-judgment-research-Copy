"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  Scale,
  ShieldAlert,
  Building2,
  FileText,
  Search,
  ExternalLink,
} from "lucide-react";
import { Act, ActSection, JudgmentSummary } from "@/lib/types";

interface ActsLibraryViewProps {
  onOpenJudgment: (id: string) => void;
  setActiveView: (view: string) => void;
  initialAct?: string;
  initialSection?: string;
}

export const ActsLibraryView: React.FC<ActsLibraryViewProps> = ({
  onOpenJudgment,
  setActiveView,
  initialAct,
  initialSection,
}) => {
  const [acts, setActs] = useState<Act[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActId, setSelectedActId] = useState<string>("");
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [selectedSection, setSelectedSection] = useState<ActSection | null>(null);
  const [sectionJudgments, setSectionJudgments] = useState<JudgmentSummary[]>([]);
  const [loadingSection, setLoadingSection] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    async function loadActs() {
      try {
        setLoading(true);
        const res = await fetch("/api/acts");
        const data = await res.json();
        setActs(data.acts || []);

        if (data.acts && data.acts.length > 0) {
          let defaultAct = data.acts[0];
          if (initialAct) {
            const found = data.acts.find(
              (a: Act) =>
                a.shortName.toLowerCase() === initialAct.toLowerCase() ||
                a.officialName.toLowerCase().includes(initialAct.toLowerCase())
            );
            if (found) defaultAct = found;
          }
          setSelectedActId(defaultAct.id);

          // Auto-expand first chapter
          if (defaultAct.chapters && defaultAct.chapters.length > 0) {
            setExpandedChapters({ [defaultAct.chapters[0].chapterNumber]: true });
            if (defaultAct.chapters[0].sections.length > 0) {
              const defaultSec = defaultAct.chapters[0].sections[0];
              loadSectionJudgments(defaultSec.id, defaultSec);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadActs();
  }, [initialAct]);

  const loadSectionJudgments = async (sectionId: string, sectionObj: ActSection) => {
    setSelectedSection(sectionObj);
    setLoadingSection(true);
    try {
      const res = await fetch(`/api/acts?sectionId=${sectionId}`);
      const data = await res.json();
      setSectionJudgments(data.judgments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSection(false);
    }
  };

  const toggleChapter = (chapterNum: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterNum]: !prev[chapterNum],
    }));
  };

  const selectedAct = acts.find((a) => a.id === selectedActId);

  // Filter Acts by Category
  const filteredActs = acts.filter((act) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Criminal Law") return act.category === "Criminal Law";
    if (activeCategory === "Civil & Commercial") return act.category !== "Criminal Law";
    return true;
  });

  // Sort section judgments
  const sortedJudgments = [...sectionJudgments].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.judgmentDate).getTime() - new Date(a.judgmentDate).getTime();
    if (sortBy === "oldest") return new Date(a.judgmentDate).getTime() - new Date(b.judgmentDate).getTime();
    if (sortBy === "court") return a.court.code === "SCI" ? -1 : 1;
    return 0;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Title & Statutory Context Alert */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 font-serif flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-amber-800" />
              <span>Act-Wise & Section-Wise Judgment Library</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Hierarchical navigation across Indian criminal and civil legislation with verified corresponding section linkages.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {["All", "Criminal Law", "Civil & Commercial"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Historical & Transitional Law Banner */}
        <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Statutory Transition Notice (1 July 2024):</span> The Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), and Bharatiya Sakshya Adhiniyam (BSA) came into force on 1 July 2024. Prior offences and pending investigations remain governed by IPC, CrPC, and IEA under Section 531 BNSS and Section 358 BNS. Equivalence is displayed as <span className="font-semibold text-emerald-800 bg-emerald-100 px-1 py-0.2 rounded">VERIFIED</span>, <span className="font-semibold text-amber-800 bg-amber-100 px-1 py-0.2 rounded">APPROXIMATE</span>, or <span className="font-semibold text-slate-700 bg-slate-200 px-1 py-0.2 rounded">UNAVAILABLE</span>.
          </div>
        </div>
      </div>

      {/* Main Grid: Acts Selector (Col 1) | Chapter & Section Tree (Col 2) | Judgments Table (Col 3 & 4) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Acts Column (3 cols) */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 p-3 shadow-sm h-fit space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 px-2 py-1 border-b border-slate-100">
            Statutes ({filteredActs.length})
          </div>
          <div className="space-y-1">
            {filteredActs.map((act) => {
              const isSelected = act.id === selectedActId;
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    setSelectedActId(act.id);
                    if (act.chapters && act.chapters.length > 0) {
                      setExpandedChapters({ [act.chapters[0].chapterNumber]: true });
                      if (act.chapters[0].sections.length > 0) {
                        loadSectionJudgments(act.chapters[0].sections[0].id, act.chapters[0].sections[0]);
                      }
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex flex-col space-y-1 ${
                    isSelected
                      ? "bg-amber-100/70 text-amber-950 border border-amber-300 font-semibold"
                      : "hover:bg-slate-50 text-slate-800 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-serif">{act.shortName}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        act.isHistorical
                          ? "bg-slate-200 text-slate-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {act.isHistorical ? "Historical" : "In Force"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">
                    {act.officialName}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>{act.totalSections} sections</span>
                    <span className="font-semibold text-amber-800">
                      {act.totalJudgments} judgments
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapters & Sections Tree (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-fit space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-serif">
              {selectedAct?.officialName}
            </h2>
            {selectedAct?.transitionalNote && (
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {selectedAct.transitionalNote}
              </p>
            )}
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {selectedAct?.chapters.map((chapter) => {
              const isExpanded = !!expandedChapters[chapter.chapterNumber];
              return (
                <div key={chapter.chapterNumber} className="border border-slate-200/80 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleChapter(chapter.chapterNumber)}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800"
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <Layers className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                      <span className="truncate">
                        {chapter.chapterNumber}: {chapter.chapterTitle}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-1.5 divide-y divide-slate-100 bg-white">
                      {chapter.sections.map((sec) => {
                        const isSecSelected = selectedSection?.id === sec.id;
                        return (
                          <div
                            key={sec.id}
                            onClick={() => loadSectionJudgments(sec.id, sec)}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                              isSecSelected
                                ? "bg-amber-50 text-amber-950 font-semibold border-l-2 border-amber-700"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-amber-900">
                                Section {sec.sectionNumber}
                              </span>
                              <div className="flex items-center space-x-1 font-mono text-[10px]">
                                {sec.scCount !== undefined && sec.scCount > 0 && (
                                  <span className="px-1 rounded bg-amber-100 text-amber-900">
                                    SC: {sec.scCount}
                                  </span>
                                )}
                                {sec.karCount !== undefined && sec.karCount > 0 && (
                                  <span className="px-1 rounded bg-blue-100 text-blue-900">
                                    Kar: {sec.karCount}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                              {sec.sectionTitle}
                            </div>

                            {/* Corresponding Section Pill */}
                            {sec.correspondingSection && (
                              <div className="mt-1 flex items-center space-x-1 text-[10px] text-slate-500 font-mono">
                                <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400" />
                                <span>&rarr; {sec.correspondingSection}</span>
                                <span className="text-[9px] px-1 rounded bg-slate-100 font-semibold">
                                  {sec.equivalenceType}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Section Details & Judgments List (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          {selectedSection ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
              {/* Section Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    {selectedAct?.shortName} Section {selectedSection.sectionNumber}
                  </span>
                  <div className="text-xs text-slate-500 font-medium">
                    <span className="font-bold text-slate-900">{sectionJudgments.length}</span>{" "}
                    Judgments
                  </div>
                </div>
                <h2 className="text-sm font-bold text-slate-900 mt-2 font-serif">
                  {selectedSection.sectionTitle}
                </h2>
                {selectedSection.contentSummary && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {selectedSection.contentSummary}
                  </p>
                )}
              </div>

              {/* Verified Corresponding-Section Box (Section 5) */}
              {selectedSection.correspondingSection && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                      <span>Corresponding Law Mapping:</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedSection.equivalenceType === "VERIFIED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {selectedSection.equivalenceType} EQUIVALENCE
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-700 font-semibold">
                    {selectedSection.correspondingActName} &mdash;{" "}
                    {selectedSection.correspondingSection}
                  </div>
                  {selectedSection.transitionalGuidance && (
                    <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200/80 leading-relaxed">
                      <span className="font-semibold text-slate-700">Practice Guidance:</span>{" "}
                      {selectedSection.transitionalGuidance}
                    </p>
                  )}
                </div>
              )}

              {/* Judgments Header & Sorter */}
              <div className="flex items-center justify-between pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Associated Court Decisions
                </h3>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs p-1 rounded border border-slate-200 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="court">Supreme Court First</option>
                  </select>
                </div>
              </div>

              {/* Judgments List */}
              {loadingSection ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Loading associated judgments...
                </div>
              ) : sortedJudgments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No verified judgments currently indexed for this specific section. Use Manual Ingestion to import.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto">
                  {sortedJudgments.map((j) => (
                    <div
                      key={j.id}
                      onClick={() => onOpenJudgment(j.id)}
                      className="py-3 hover:bg-slate-50/80 px-2 rounded cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span
                          className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                            j.court.code === "SCI"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-blue-100 text-blue-900"
                          }`}
                        >
                          {j.court.name}
                        </span>
                        <span className="font-mono text-slate-400">{j.formattedDate}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-serif">
                        {j.title}
                      </h4>
                      {j.neutralCitation && (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {j.neutralCitation}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                        {j.headnote || "Verified court ruling interpreting statutory section."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a section from the chapters tree to study verified judgments and transitional law equivalence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
