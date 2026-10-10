"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Trash2, Building2, ExternalLink } from "lucide-react";
import { UserSession } from "@/lib/types";

interface BookmarksViewProps {
  currentUser: UserSession | null;
  onOpenAuth: () => void;
  onOpenJudgment: (id: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  currentUser,
  onOpenAuth,
  onOpenJudgment,
}) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await fetch("/api/bookmarks");
      const json = await res.json();
      setBookmarks(json.bookmarks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadBookmarks();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const removeBookmark = async (judgmentId: string) => {
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgmentId }),
      });
      setBookmarks(bookmarks.filter((b) => b.judgmentId !== judgmentId));
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
        <Bookmark className="w-10 h-10 text-amber-700 mx-auto" />
        <h2 className="text-base font-bold text-slate-800 font-serif">
          Advocate Sign-In Required
        </h2>
        <p className="text-xs text-slate-500">
          Sign in to view your saved bookmarked judgments and private legal notes.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-3 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
        >
          Advocate Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h1 className="text-base font-bold text-slate-900 font-serif flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-amber-700" />
          <span>My Bookmarked Judgments ({bookmarks.length})</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quick-access legal library of authorities saved during your research sessions.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-xs text-slate-400">Loading saved bookmarks...</span>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          You haven&apos;t bookmarked any judgments yet. Click the bookmark icon on any judgment page to save.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between group"
            >
              <div
                onClick={() => onOpenJudgment(b.judgment.id)}
                className="cursor-pointer flex-1 pr-4"
              >
                <div className="flex items-center space-x-2 text-[11px] mb-1">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      b.judgment.court.code === "SCI"
                        ? "bg-amber-100 text-amber-900 border border-amber-200"
                        : "bg-blue-100 text-blue-900 border border-blue-200"
                    }`}
                  >
                    {b.judgment.court.name}
                  </span>
                  <span className="font-mono text-slate-500">
                    {b.judgment.formattedDate}
                  </span>
                  {b.judgment.neutralCitation && (
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {b.judgment.neutralCitation}
                    </span>
                  )}
                </div>

                <h2 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-serif">
                  {b.judgment.title}
                </h2>

                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {b.judgment.headnote || "Verified official court record."}
                </p>

                {b.notes && (
                  <div className="text-[11px] text-amber-950 bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                    <span className="font-semibold">My Private Note:</span> {b.notes}
                  </div>
                )}
              </div>

              <button
                onClick={() => removeBookmark(b.judgment.id)}
                title="Remove bookmark"
                className="p-1.5 text-slate-300 hover:text-red-600 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
