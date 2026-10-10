"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/DashboardView";
import { CourtExplorerView } from "@/components/CourtExplorerView";
import { ActsLibraryView } from "@/components/ActsLibraryView";
import { SearchResultsView } from "@/components/SearchResultsView";
import { JudgmentWorkspace } from "@/components/JudgmentWorkspace";
import { ComparisonView } from "@/components/ComparisonView";
import { ResearchFoldersView } from "@/components/ResearchFoldersView";
import { BookmarksView } from "@/components/BookmarksView";
import { AdminIngestionView } from "@/components/AdminIngestionView";
import { AuthModal } from "@/components/AuthModal";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { UserSession, JudgmentSummary } from "@/lib/types";
import { SearchResultItem, SearchFilters } from "@/lib/search-engine";

export default function Home() {
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchTotal, setSearchTotal] = useState<number>(0);
  const [parsedQueryMeta, setParsedQueryMeta] = useState<any>(null);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({
    page: 1,
    pageSize: 10,
    sortBy: "relevance",
  });

  // Selected views state
  const [selectedJudgmentId, setSelectedJudgmentId] = useState<string | null>(null);
  const [selectedCourtCode, setSelectedCourtCode] = useState<string>("SCI");
  const [selectedBench, setSelectedBench] = useState<string | undefined>(undefined);
  const [selectedActName, setSelectedActName] = useState<string | undefined>(undefined);

  // Advocate state
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [recentJudgments, setRecentJudgments] = useState<JudgmentSummary[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<SearchResultItem[]>([]);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);

  // Load User Session & Initial Dashboard Data
  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      } else {
        // Auto-login with default advocate Siddharudha Tegur for smooth initial UX if not logged in
        const autoLogin = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "advocate@supremecourt.in",
            password: "Advocate@2026",
          }),
        });
        const loginData = await autoLogin.json();
        if (loginData.success) {
          setCurrentUser(loginData.user);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      // Recent judgments
      const resRecent = await fetch("/api/search?pageSize=8&sortBy=newest");
      const jsonRecent = await resRecent.json();
      setRecentJudgments(jsonRecent.results || []);

      // Bookmarks
      const resBm = await fetch("/api/bookmarks");
      if (resBm.ok) {
        const jsonBm = await resBm.json();
        setBookmarks(jsonBm.bookmarks || []);
      }

      // Folders
      const resFol = await fetch("/api/folders");
      if (resFol.ok) {
        const jsonFol = await resFol.json();
        setFolders(jsonFol.folders || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadUser().then(() => {
      loadInitialData();
    });
  }, [loadUser, loadInitialData]);

  // Handle Search Trigger
  const handleSearch = async (query: string, filters?: SearchFilters) => {
    const merged: SearchFilters = {
      ...currentFilters,
      query: query || undefined,
      ...(filters || {}),
      page: 1,
    };
    setCurrentFilters(merged);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
      setSearchTotal(data.totalCount || 0);
      setParsedQueryMeta(data.parsedQueryMetadata);
      setActiveView("search");
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenJudgment = (id: string) => {
    setSelectedJudgmentId(id);
    setActiveView("judgment_workspace");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleCompare = (j: any) => {
    const exists = selectedForCompare.some((item) => item.id === j.id);
    if (exists) {
      setSelectedForCompare(selectedForCompare.filter((item) => item.id !== j.id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], j]);
      } else {
        setSelectedForCompare([...selectedForCompare, j]);
      }
    }
  };

  const handleBookmarkToggle = async (judgmentId: string) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgmentId }),
      });
      // Refresh bookmarks
      const resBm = await fetch("/api/bookmarks");
      if (resBm.ok) {
        const jsonBm = await resBm.json();
        setBookmarks(jsonBm.bookmarks || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    setBookmarks([]);
    setFolders([]);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement)?.blur();
        }
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setShowShortcutsModal(true);
      } else if (e.key === "Escape") {
        setShowAuthModal(false);
        setShowShortcutsModal(false);
      } else if (e.key === "d" || e.key === "D") {
        setActiveView("dashboard");
      } else if (e.key === "s" || e.key === "S") {
        setSelectedCourtCode("SCI");
        setActiveView("court_sci");
      } else if (e.key === "k" || e.key === "K") {
        setSelectedCourtCode("HCKAR");
        setActiveView("court_hckar");
      } else if (e.key === "a" || e.key === "A") {
        setActiveView("acts");
      } else if (e.key === "b" || e.key === "B") {
        setActiveView("bookmarks");
      } else if (e.key === "f" || e.key === "F") {
        setActiveView("folders");
      } else if (e.key === "c" || e.key === "C") {
        setActiveView("compare");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const bookmarkedIds = new Set(bookmarks.map((b) => b.judgmentId || b.id));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Desktop Sidebar */}
        <div className="hidden lg:flex">
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            onSelectCourt={(code) => {
              setSelectedCourtCode(code);
              setSelectedBench(undefined);
            }}
            onSelectBench={(bench) => {
              setSelectedCourtCode("HCKAR");
              setSelectedBench(bench);
            }}
            bookmarksCount={bookmarks.length}
            foldersCount={folders.length}
          />
        </div>

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeView === "dashboard" && (
            <DashboardView
              onSearch={handleSearch}
              onOpenJudgment={handleOpenJudgment}
              onSelectCourt={(code) => {
                setSelectedCourtCode(code);
                setActiveView(code === "SCI" ? "court_sci" : "court_hckar");
              }}
              onSelectAct={(actName) => {
                setSelectedActName(actName);
                setActiveView("acts");
              }}
              setActiveView={setActiveView}
              recentJudgments={recentJudgments}
              bookmarks={bookmarks}
              folders={folders}
              history={history}
            />
          )}

          {(activeView === "court_sci" || activeView === "court_hckar") && (
            <CourtExplorerView
              courtCode={activeView === "court_sci" ? "SCI" : "HCKAR"}
              initialBench={selectedBench}
              onOpenJudgment={handleOpenJudgment}
              setActiveView={setActiveView}
            />
          )}

          {activeView === "acts" && (
            <ActsLibraryView
              onOpenJudgment={handleOpenJudgment}
              setActiveView={setActiveView}
              initialAct={selectedActName}
            />
          )}

          {activeView === "search" && (
            <SearchResultsView
              results={searchResults}
              totalCount={searchTotal}
              parsedQueryMetadata={parsedQueryMeta}
              currentFilters={currentFilters}
              onFilterChange={(newFilters) => handleSearch(currentFilters.query || "", newFilters)}
              onOpenJudgment={handleOpenJudgment}
              onToggleCompare={handleToggleCompare}
              selectedForCompare={selectedForCompare}
              onBookmark={handleBookmarkToggle}
              bookmarkedIds={bookmarkedIds}
            />
          )}

          {activeView === "judgment_workspace" && selectedJudgmentId && (
            <JudgmentWorkspace
              judgmentId={selectedJudgmentId}
              onBack={() => {
                if (searchResults.length > 0) setActiveView("search");
                else setActiveView("dashboard");
              }}
              currentUser={currentUser}
              onOpenAuth={() => setShowAuthModal(true)}
              onToggleCompare={handleToggleCompare}
              isCompared={selectedForCompare.some((j) => j.id === selectedJudgmentId)}
            />
          )}

          {activeView === "compare" && (
            <ComparisonView
              selectedJudgments={selectedForCompare}
              onRemove={(id) =>
                setSelectedForCompare(selectedForCompare.filter((j) => j.id !== id))
              }
              onClear={() => setSelectedForCompare([])}
              onOpenJudgment={handleOpenJudgment}
            />
          )}

          {activeView === "folders" && (
            <ResearchFoldersView
              currentUser={currentUser}
              onOpenAuth={() => setShowAuthModal(true)}
              onOpenJudgment={handleOpenJudgment}
            />
          )}

          {activeView === "bookmarks" && (
            <BookmarksView
              currentUser={currentUser}
              onOpenAuth={() => setShowAuthModal(true)}
              onOpenJudgment={handleOpenJudgment}
            />
          )}

          {activeView === "admin" && (
            <AdminIngestionView
              currentUser={currentUser}
              onOpenAuth={() => setShowAuthModal(true)}
              onOpenJudgment={handleOpenJudgment}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadInitialData();
        }}
      />

      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
