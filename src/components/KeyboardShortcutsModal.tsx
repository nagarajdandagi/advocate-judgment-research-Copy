"use client";

import React from "react";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "/", description: "Focus global judgment search bar" },
    { key: "Esc", description: "Close modals, drawers, or active reading panes" },
    { key: "D", description: "Return to Main Advocate Dashboard" },
    { key: "S", description: "Open Supreme Court of India Explorer" },
    { key: "K", description: "Open High Court of Karnataka Explorer" },
    { key: "A", description: "Open Acts & Sections Library" },
    { key: "B", description: "View Bookmarked Judgments" },
    { key: "F", description: "View Case Research Folders" },
    { key: "C", description: "View Judgment Comparison Tool" },
    { key: "P", description: "Print current judgment or research list" },
    { key: "?", description: "Open keyboard shortcuts cheat-sheet" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-amber-700" />
            <h2 className="text-sm font-bold text-slate-900 font-serif">
              Advocate Keyboard Shortcuts
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between">
              <span className="text-slate-600">{s.description}</span>
              <kbd className="px-2 py-1 rounded bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-200 shadow-2xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[11px] text-slate-400">
          Press <kbd className="font-mono bg-slate-100 px-1 rounded">Esc</kbd> anytime to dismiss.
        </div>
      </div>
    </div>
  );
};
