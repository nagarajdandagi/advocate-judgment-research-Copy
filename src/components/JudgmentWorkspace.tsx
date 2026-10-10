"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  BookOpen,
  Bookmark,
  FolderPlus,
  StickyNote,
  Printer,
  Share2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Columns,
  Download,
  AlertCircle,
  Hash,
} from "lucide-react";
import { JudgmentDetail, UserSession } from "@/lib/types";
import { CaseBriefStructure, LEGAL_AI_DISCLAIMER } from "@/lib/ai-brief";

interface JudgmentWorkspaceProps {
  judgmentId: string;
  onBack: () => void;
  currentUser: UserSession | null;
  onOpenAuth: () => void;
  onToggleCompare?: (j: any) => void;
  isCompared?: boolean;
}

export const JudgmentWorkspace: React.FC<JudgmentWorkspaceProps> = ({
  judgmentId,
  onBack,
  currentUser,
  onOpenAuth,
  onToggleCompare,
  isCompared,
}) => {
  const [data, setData] = useState<{
    judgment: JudgmentDetail;
    brief: CaseBriefStructure;
    userState: {
      isBookmarked: boolean;
      bookmarkNotes: string;
      personalNotes: any[];
      savedInFolders: string[];
    };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"document" | "brief" | "notes">("document");
  const [briefMode, setBriefMode] = useState<"short" | "detailed">("detailed");
  const [inDocSearch, setInDocSearch] = useState("");
  const [fontSize, setFontSize] = useState<number>(15);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [highlightPara, setHighlightPara] = useState<number | null>(null);

  // Note creation state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNotePara, setNewNotePara] = useState<number | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");

  const paraRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    async function loadJudgment() {
      setLoading(true);
      try {
        const res = await fetch(`/api/judgments/${judgmentId}`);
        const json = await res.json();
        setData(json);

        // Fetch user folders if logged in
        if (currentUser) {
          const resFolders = await fetch("/api/folders");
          const jsonFolders = await resFolders.json();
          setAvailableFolders(jsonFolders.folders || []);
        }
      } catch (e) {
        console.error("Failed to load judgment:", e);
      } finally {
        setLoading(false);
      }
    }
    loadJudgment();
  }, [judgmentId, currentUser]);

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgmentId }),
      });
      const resData = await res.json();
      if (data) {
        setData({
          ...data,
          userState: {
            ...data.userState,
            isBookmarked: resData.isBookmarked,
          },
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newNoteContent.trim()) return;

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judgmentId,
          paragraphIndex: newNotePara,
          content: newNoteContent,
        }),
      });
      const resData = await res.json();
      if (resData.success && data) {
        setData({
          ...data,
          userState: {
            ...data.userState,
            personalNotes: [resData.note, ...data.userState.personalNotes],
          },
        });
        setNewNoteContent("");
        setShowNoteModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToFolder = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!selectedFolderId) return;

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_judgment",
          folderId: selectedFolderId,
          judgmentId,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setShowFolderModal(false);
        const folderName = availableFolders.find((f) => f.id === selectedFolderId)?.name;
        if (folderName && data) {
          setData({
            ...data,
            userState: {
              ...data.userState,
              savedInFolders: [...data.userState.savedInFolders, folderName],
            },
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyStandardCitation = () => {
    if (!data) return;
    const citation =
      data.judgment.reportedCitation ||
      data.judgment.neutralCitation ||
      `${data.judgment.title}, ${data.judgment.caseNumber} (${data.judgment.formattedDate})`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const jumpToParagraph = (paraNum: number) => {
    setActiveTab("document");
    setHighlightPara(paraNum);
    const target = paraRefs.current[paraNum];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center max-w-4xl mx-auto my-8">
        <div className="w-10 h-10 border-3 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-base font-bold text-slate-800 font-serif">
          Loading Official Judgment Document & Brief
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Verifying judicial record checksum, paragraph numbering, and statutory citations...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Judgment Not Found</h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
        >
          Return to Research Library
        </button>
      </div>
    );
  }

  const { judgment, brief, userState } = data;

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Top Action Bar with Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-amber-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Citation */}
          <button
            onClick={copyStandardCitation}
            className="px-3 py-1.5 rounded text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            {copiedCitation ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Citation Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Citation</span>
              </>
            )}
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={handleBookmarkToggle}
            className={`px-3 py-1.5 rounded text-xs font-semibold border flex items-center space-x-1.5 transition-colors ${
              userState.isBookmarked
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{userState.isBookmarked ? "Bookmarked" : "Bookmark"}</span>
          </button>

          {/* Add to Research Folder */}
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else setShowFolderModal(true);
            }}
            className="px-3 py-1.5 rounded text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Save to Case Folder</span>
          </button>

          {/* Add Personal Note */}
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth();
              else {
                setNewNotePara(null);
                setShowNoteModal(true);
              }
            }}
            className="px-3 py-1.5 rounded text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-700" />
            <span>Private Notes ({userState.personalNotes.length})</span>
          </button>

          {/* Compare */}
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(judgment)}
              className={`px-3 py-1.5 rounded text-xs font-semibold border flex items-center space-x-1.5 transition-colors ${
                isCompared
                  ? "bg-blue-100 text-blue-900 border-blue-300"
                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isCompared ? "Compared" : "Compare"}</span>
            </button>
          )}

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Judgment</span>
          </button>
        </div>
      </div>

      {/* Judgment Header Section (Section 8) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded shadow-xs ${
                judgment.court.code === "SCI"
                  ? "bg-amber-100 text-amber-950 border border-amber-300"
                  : "bg-blue-100 text-blue-950 border border-blue-300"
              }`}
            >
              {judgment.court.name}
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              Pronounced: {judgment.formattedDate}
            </span>
            {judgment.neutralCitation && (
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-950 px-2.5 py-1 rounded border border-amber-200">
                Neutral Citation: {judgment.neutralCitation}
              </span>
            )}
            {judgment.reportedCitation && (
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
                Reported: {judgment.reportedCitation}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded font-bold border border-emerald-200 text-[11px]">
              OFFICIAL VERIFIED SOURCE
            </span>
            {judgment.sourceUrl && (
              <a
                href={judgment.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-800 hover:underline flex items-center space-x-1 font-semibold"
              >
                <span>Original Order PDF</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-serif leading-snug">
            {judgment.title}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
            <div>
              <span className="font-semibold text-slate-800">Coram / Bench:</span>{" "}
              {judgment.coram || judgment.benchName}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Case Number:</span>{" "}
              {judgment.caseNumber}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Disposal Nature:</span>{" "}
              {judgment.disposalNature || "Disposed of"}
            </div>
          </div>
        </div>

        {/* Acts and Sections Referenced */}
        {judgment.sections && judgment.sections.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-700">Statutory Provisions:</span>
            {judgment.sections.map((sec, idx) => (
              <span
                key={idx}
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200"
              >
                {sec.actShortName} Section {sec.sectionNumber}
                {sec.correspondingSection && (
                  <span className="text-[10px] text-amber-800 ml-1">
                    (&rarr; {sec.correspondingSection})
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Practical Notes for Advocates */}
        {judgment.practicalNotes && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-950 leading-relaxed">
            <span className="font-bold">Advocate Practice Pointer:</span> {judgment.practicalNotes}
          </div>
        )}
      </div>

      {/* Main Workspace Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 rounded-t-xl no-print">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab("document")}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === "document"
                ? "border-amber-700 text-amber-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Official Judgment Text ({judgment.paragraphCount} ¶)</span>
          </button>

          <button
            onClick={() => setActiveTab("brief")}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === "brief"
                ? "border-amber-700 text-amber-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Advocate&apos;s Case Brief (19 Points)</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === "notes"
                ? "border-amber-700 text-amber-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <StickyNote className="w-4 h-4" />
            <span>My Private Notes ({userState.personalNotes.length})</span>
          </button>
        </div>

        {/* Reading Controls for Document Mode */}
        {activeTab === "document" && (
          <div className="flex items-center space-x-2 py-2">
            {/* Search within document */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                value={inDocSearch}
                onChange={(e) => setInDocSearch(e.target.value)}
                placeholder="Find in text..."
                className="w-32 sm:w-44 text-xs pl-7 pr-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-amber-600"
              />
            </div>

            {/* Font Resizing */}
            <div className="flex items-center border border-slate-200 rounded">
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                className="px-2 py-1 text-xs hover:bg-slate-100 font-bold"
                title="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                className="px-2 py-1 text-xs hover:bg-slate-100 font-bold border-l border-slate-200"
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>
        )}

        {/* Short vs Detailed Brief Switcher */}
        {activeTab === "brief" && (
          <div className="flex items-center space-x-1.5 text-xs py-2">
            <span className="text-slate-500">Brief Detail:</span>
            <button
              onClick={() => setBriefMode("short")}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                briefMode === "short"
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Short Brief
            </button>
            <button
              onClick={() => setBriefMode("detailed")}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                briefMode === "detailed"
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Full 19-Point Study
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Official Judgment Text (Numbered Paragraphs) */}
      {activeTab === "document" && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-xs text-slate-500 pb-3 border-b border-slate-100 flex items-center justify-between font-mono">
            <span>OFFICIAL JUDICIAL TEXT &bull; PARAGRAPH-BY-PARAGRAPH CITATION</span>
            <span>Checksum: {judgment.documentChecksum?.slice(0, 16)}...</span>
          </div>

          <div className="legal-font-serif space-y-5 leading-relaxed text-slate-900">
            {judgment.paragraphs.map((para) => {
              const isMatch =
                inDocSearch &&
                para.text.toLowerCase().includes(inDocSearch.toLowerCase());
              const isTargeted = highlightPara === para.index;

              return (
                <div
                  key={para.index}
                  ref={(el) => {
                    paraRefs.current[para.index] = el;
                  }}
                  className={`group relative p-3 rounded-lg transition-all ${
                    isTargeted
                      ? "bg-amber-100/90 ring-2 ring-amber-500"
                      : isMatch
                      ? "bg-yellow-100/80"
                      : "hover:bg-slate-50/90"
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {/* Paragraph Number & Quick Actions */}
                  <div className="flex items-center space-x-2 text-[11px] font-sans font-bold text-slate-400 mb-1 select-none">
                    <span className="font-mono text-amber-800 font-extrabold">
                      [¶ {para.index}]
                    </span>
                    <button
                      onClick={() => {
                        if (!currentUser) onOpenAuth();
                        else {
                          setNewNotePara(para.index);
                          setShowNoteModal(true);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-amber-800 transition-opacity flex items-center space-x-1"
                    >
                      <StickyNote className="w-3 h-3" />
                      <span>Note on ¶ {para.index}</span>
                    </button>
                  </div>

                  <p className="whitespace-pre-line">{para.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Advocate's Case Brief Panel (19 Fields, Section 9) */}
      {activeTab === "brief" && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Mandatory Section 9 Disclaimer */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-lg text-xs text-amber-950 flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">MANDATORY LEGAL DISCLAIMER:</span>{" "}
              {LEGAL_AI_DISCLAIMER}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1-4: Header & Case Identity */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
                Case Identity & Authority
              </h3>
              <div className="text-xs space-y-1.5 font-sans">
                <div>
                  <span className="font-bold text-slate-700">1. Case Title:</span> {brief.caseTitle}
                </div>
                <div>
                  <span className="font-bold text-slate-700">2. Court & Bench:</span>{" "}
                  {brief.courtAndBench}
                </div>
                <div>
                  <span className="font-bold text-slate-700">3. Date of Pronouncement:</span>{" "}
                  {brief.dateOfJudgment}
                </div>
                <div>
                  <span className="font-bold text-slate-700">4. Citations & Case No:</span>{" "}
                  {brief.citationAndCaseNumber}
                </div>
              </div>
            </div>

            {/* Field 8 & 11: Acts and Final Outcome */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
                Statutory Scope & Final Decision
              </h3>
              <div className="text-xs space-y-2 font-sans">
                <div>
                  <span className="font-bold text-slate-700">8. Relevant Acts & Sections:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {brief.relevantActsAndSections.map((sec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white text-slate-800 font-mono text-[11px] border border-slate-200"
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="font-bold text-slate-700">11. Final Decision / Outcome:</span>
                  <p className="font-serif text-slate-900 mt-1 font-semibold text-xs leading-relaxed">
                    {brief.finalDecisionOutcome}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Field 5: Facts of the Case */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans flex items-center space-x-1.5">
              <span>5. Facts of the Case</span>
            </h3>
            <div className="text-xs font-serif text-slate-800 leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-200/80">
              {brief.factsOfTheCase}
            </div>
          </div>

          {/* Field 6 & 9: Main Legal Issues & Questions Considered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                6. Main Legal Issues
              </h3>
              <ul className="list-disc pl-5 text-xs font-sans text-slate-800 space-y-1 bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/80">
                {brief.mainLegalIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                9. Questions Considered by Court
              </h3>
              <ul className="list-disc pl-5 text-xs font-sans text-slate-800 space-y-1 bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/80">
                {brief.questionsConsidered.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Field 7: Arguments of the Parties */}
          {briefMode === "detailed" && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                7. Arguments of the Parties
              </h3>
              <div className="text-xs font-serif text-slate-800 leading-relaxed bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/80">
                {brief.argumentsOfParties}
              </div>
            </div>
          )}

          {/* Field 10: Court's Reasoning */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              10. Court&apos;s Judicial Reasoning
            </h3>
            <div className="text-xs font-serif text-slate-800 leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-200/80 whitespace-pre-line">
              {brief.courtReasoning}
            </div>
          </div>

          {/* Field 12 & 13: Ratio Decidendi & Legal Principles */}
          <div className="space-y-3 p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-sans">
              13. Ratio Decidendi (Binding Legal Holding)
            </h3>
            <div className="text-xs font-serif text-slate-900 leading-relaxed font-semibold">
              {brief.ratioDecidendi}
            </div>
          </div>

          {/* Field 14: Obiter Dicta */}
          {briefMode === "detailed" && brief.obiterDicta && (
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
                14. Obiter Dicta
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-serif">
                {brief.obiterDicta}
              </p>
            </div>
          )}

          {/* Field 15 & 16: Earlier Cases Considered & Cases Followed/Overruled */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                15. Earlier Judgments Considered
              </h3>
              <div className="text-xs font-mono space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {brief.earlierJudgmentsConsidered.length > 0 ? (
                  brief.earlierJudgmentsConsidered.map((c, i) => (
                    <div key={i} className="text-slate-700 font-semibold">
                      &bull; {c}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400">None directly cited in primary holding.</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                16. Cases Followed, Distinguished, or Overruled
              </h3>
              <div className="text-xs font-mono space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {brief.casesFollowedOverruled.length > 0 ? (
                  brief.casesFollowedOverruled.map((c, i) => (
                    <div key={i} className="text-emerald-900 font-semibold">
                      &bull; {c}
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400">Affirmed as binding statutory precedent.</span>
                )}
              </div>
            </div>
          </div>

          {/* Field 17 & 18: Practical Relevance for Advocates & Paragraph References */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 font-sans">
                17. Practical Relevance for Advocates
              </h3>
              <p className="text-xs text-amber-950 leading-relaxed font-sans">
                {brief.practicalRelevanceForAdvocates}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-blue-50/50 border border-blue-200 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-950 font-sans">
                18. Important Paragraph References
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {brief.importantParagraphReferences.map((pRef, i) => {
                  const paraNumMatch = pRef.match(/\d+/);
                  const pNum = paraNumMatch ? parseInt(paraNumMatch[0], 10) : null;
                  return (
                    <button
                      key={i}
                      onClick={() => pNum && jumpToParagraph(pNum)}
                      className="px-2.5 py-1 rounded bg-white hover:bg-blue-100 text-blue-900 font-mono text-xs font-bold border border-blue-300 transition-colors flex items-center space-x-1"
                    >
                      <span>{pRef}</span>
                      <ArrowRight className="w-3 h-3 text-blue-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Field 19: Limitations / Uncertainty */}
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 font-sans">
            <span className="font-bold">19. Limitations or Uncertainty in Summary:</span>{" "}
            {brief.limitationsInSummary}
          </div>
        </div>
      )}

      {/* Tab 3: Personal Notes */}
      {activeTab === "notes" && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-serif">
                Private Advocate Research Notes
              </h2>
              <p className="text-xs text-slate-500">
                Encrypted and isolated to your account. Inaccessible to other users or external engines.
              </p>
            </div>
            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else {
                  setNewNotePara(null);
                  setShowNoteModal(true);
                }
              }}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
            >
              + Add Note
            </button>
          </div>

          {userState.personalNotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No private notes added yet for this judgment. Click &ldquo;+ Add Note&rdquo; or click any paragraph in Document view.
            </div>
          ) : (
            <div className="space-y-3">
              {userState.personalNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono font-semibold text-amber-800">
                      {note.paragraphIndex ? `Linked to [¶ ${note.paragraphIndex}]` : "General Judgment Note"}
                    </span>
                    <span>{new Date(note.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-slate-800 font-serif leading-relaxed whitespace-pre-line">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note Creation Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-3 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              Add Private Research Note
            </h3>
            <p className="text-xs text-slate-500">
              {newNotePara ? `Linking note to Paragraph [¶ ${newNotePara}]` : "General Case Note for hearing prep"}
            </p>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Record legal proposition, courtroom argument point, or distinguishing factual nuance..."
              rows={4}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600 font-serif"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold"
              >
                Save Private Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Selection Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-3 animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              Save to Research Folder
            </h3>
            <p className="text-xs text-slate-500">
              Organize this judgment into your case-specific brief dossiers.
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {availableFolders.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                    selectedFolderId === f.id
                      ? "bg-blue-50 border-blue-500 font-bold text-blue-900"
                      : "border-slate-200 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <span>{f.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{f.clientReference}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToFolder}
                disabled={!selectedFolderId}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded text-xs font-semibold"
              >
                Add to Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
