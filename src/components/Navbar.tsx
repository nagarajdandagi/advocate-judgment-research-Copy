"use client";

import React from "react";
import { Scale, BookOpen, Shield, User, LogOut, Keyboard, Smartphone } from "lucide-react";
import { UserSession } from "@/lib/types";

interface NavbarProps {
  currentUser: UserSession | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenShortcuts: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenShortcuts,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Application Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveView("dashboard")}
          >
            <div className="w-10 h-10 rounded bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow text-amber-100 border border-amber-500/30 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white font-serif">
                  ADVOCATE JUDGMENT RESEARCH
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  INDIA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Supreme Court of India &bull; High Court of Karnataka
              </p>
            </div>
          </div>

          {/* Quick Actions / Session */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onOpenShortcuts}
              title="Keyboard Shortcuts (?)"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors hidden sm:flex items-center space-x-1 text-xs border border-slate-700/60"
            >
              <Keyboard className="w-4 h-4" />
              <span className="text-[11px] text-slate-400">Keys</span>
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-mono">
                    {currentUser.barRegistrationNo || "Advocate"}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out of research session"
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-700 hover:bg-amber-600 text-white shadow-sm transition-colors border border-amber-600"
              >
                <User className="w-3.5 h-3.5" />
                <span>Advocate Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
