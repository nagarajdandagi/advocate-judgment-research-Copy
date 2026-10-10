"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  BookOpen,
  Search,
  Bookmark,
  FolderCheck,
  Columns,
  UploadCloud,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onSelectCourt: (courtCode: string) => void;
  onSelectBench?: (benchName: string) => void;
  bookmarksCount: number;
  foldersCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onSelectCourt,
  onSelectBench,
  bookmarksCount,
  foldersCount,
}) => {
  const [sciOpen, setSciOpen] = React.useState(true);
  const [hckarOpen, setHckarOpen] = React.useState(true);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col flex-shrink-0 text-sm">
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
          Digital Law Library
        </div>
        <div className="text-xs text-amber-400/90 font-serif mt-0.5">
          Advocate Research Portal
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Dashboard */}
        <button
          onClick={() => setActiveView("dashboard")}
          className={`w-full flex items-center px-3 py-2 rounded-md font-medium text-xs transition-colors ${
            activeView === "dashboard"
              ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
              : "hover:bg-slate-800 text-slate-300"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mr-2.5 text-slate-400" />
          <span>Opening Dashboard</span>
        </button>

        {/* Supreme Court Section */}
        <div className="pt-2">
          <div
            onClick={() => {
              setSciOpen(!sciOpen);
              onSelectCourt("SCI");
              setActiveView("court_sci");
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs cursor-pointer transition-colors ${
              activeView === "court_sci"
                ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-2.5 text-amber-400" />
              <span>Supreme Court of India</span>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                sciOpen ? "rotate-90" : ""
              }`}
            />
          </div>

          {sciOpen && (
            <div className="pl-6 pr-2 py-1 space-y-0.5">
              <button
                onClick={() => {
                  onSelectCourt("SCI");
                  setActiveView("court_sci");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              >
                Criminal Matters
              </button>
              <button
                onClick={() => {
                  onSelectCourt("SCI");
                  setActiveView("court_sci");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              >
                Constitutional Matters
              </button>
              <button
                onClick={() => {
                  onSelectCourt("SCI");
                  setActiveView("court_sci");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              >
                Bail & Anticipatory Bail
              </button>
              <button
                onClick={() => {
                  onSelectCourt("SCI");
                  setActiveView("court_sci");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              >
                Special Leave Petitions
              </button>
            </div>
          )}
        </div>

        {/* High Court of Karnataka Section */}
        <div className="pt-2">
          <div
            onClick={() => {
              setHckarOpen(!hckarOpen);
              onSelectCourt("HCKAR");
              setActiveView("court_hckar");
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs cursor-pointer transition-colors ${
              activeView === "court_hckar"
                ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-2.5 text-blue-400" />
              <span>High Court of Karnataka</span>
            </div>
            <ChevronRight
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                hckarOpen ? "rotate-90" : ""
              }`}
            />
          </div>

          {hckarOpen && (
            <div className="pl-6 pr-2 py-1 space-y-0.5">
              <button
                onClick={() => {
                  if (onSelectBench) onSelectBench("Bengaluru");
                  setActiveView("court_hckar");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 flex items-center justify-between"
              >
                <span>Bengaluru Bench</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>
              <button
                onClick={() => {
                  if (onSelectBench) onSelectBench("Dharwad");
                  setActiveView("court_hckar");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 flex items-center justify-between"
              >
                <span>Dharwad Bench</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>
              <button
                onClick={() => {
                  if (onSelectBench) onSelectBench("Kalaburagi");
                  setActiveView("court_hckar");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 flex items-center justify-between"
              >
                <span>Kalaburagi Bench</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>
              <button
                onClick={() => {
                  onSelectCourt("HCKAR");
                  setActiveView("court_hckar");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              >
                Bail Matters (Section 438/439)
              </button>
              <button
                onClick={() => {
                  onSelectCourt("HCKAR");
                  setActiveView("court_hckar");
                }}
                className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
              >
                Inherent Powers (482 / 528)
              </button>
            </div>
          )}
        </div>

        {/* Acts and Sections Library */}
        <div className="pt-2">
          <button
            onClick={() => setActiveView("acts")}
            className={`w-full flex items-center px-3 py-2 rounded-md font-medium text-xs transition-colors ${
              activeView === "acts"
                ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2.5 text-amber-400" />
            <span>Acts & Sections Library</span>
          </button>
        </div>

        {/* Advanced Search */}
        <div>
          <button
            onClick={() => setActiveView("search")}
            className={`w-full flex items-center px-3 py-2 rounded-md font-medium text-xs transition-colors ${
              activeView === "search"
                ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <Search className="w-4 h-4 mr-2.5 text-slate-400" />
            <span>Advanced Legal Search</span>
          </button>
        </div>

        {/* Bookmarks */}
        <div>
          <button
            onClick={() => setActiveView("bookmarks")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs transition-colors ${
              activeView === "bookmarks"
                ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <div className="flex items-center">
              <Bookmark className="w-4 h-4 mr-2.5 text-amber-400" />
              <span>Bookmarked Judgments</span>
            </div>
            {bookmarksCount > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-800 text-amber-300 rounded text-[10px] font-mono border border-slate-700">
                {bookmarksCount}
              </span>
            )}
          </button>
        </div>

        {/* Research Folders */}
        <div>
          <button
            onClick={() => setActiveView("folders")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-xs transition-colors ${
              activeView === "folders"
                ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <div className="flex items-center">
              <FolderCheck className="w-4 h-4 mr-2.5 text-blue-400" />
              <span>Research Folders</span>
            </div>
            {foldersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-800 text-blue-300 rounded text-[10px] font-mono border border-slate-700">
                {foldersCount}
              </span>
            )}
          </button>
        </div>

        {/* Comparison Tool */}
        <div>
          <button
            onClick={() => setActiveView("compare")}
            className={`w-full flex items-center px-3 py-2 rounded-md font-medium text-xs transition-colors ${
              activeView === "compare"
                ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <Columns className="w-4 h-4 mr-2.5 text-slate-400" />
            <span>Judgment Comparison</span>
          </button>
        </div>

        {/* Ingestion & Admin */}
        <div className="pt-2 border-t border-slate-800 mt-2">
          <button
            onClick={() => setActiveView("admin")}
            className={`w-full flex items-center px-3 py-2 rounded-md font-medium text-xs transition-colors ${
              activeView === "admin"
                ? "bg-amber-800/30 text-amber-200 border border-amber-600/40"
                : "hover:bg-slate-800 text-slate-400"
            }`}
          >
            <UploadCloud className="w-4 h-4 mr-2.5 text-slate-400" />
            <span>Admin & Ingestion Desk</span>
          </button>
        </div>
      </nav>

      {/* Network / Offline Mode Indicator */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Local Wi-Fi Network Ready</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
          Host: 0.0.0.0 (Port 3000)
        </div>
      </div>
    </aside>
  );
};
