"use client";

import React, { useState } from "react";
import { Search, X, SlidersHorizontal, Calendar, ArrowRight, Sparkles } from "lucide-react";

interface GlobalSearchBarProps {
  onSearch: (query: string, filters?: any) => void;
  initialQuery?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onSearch,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [court, setCourt] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [act, setAct] = useState("");
  const [section, setSection] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch(query, {
      court: court || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      act: act || undefined,
      section: section || undefined,
    });
  };

  const setSampleQuery = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center shadow-sm rounded-lg bg-white border border-slate-300 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          <div className="pl-4 text-slate-400">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by legal issue, Act & Section, citation, party name, or court holding (e.g. 'IPC Section 420 cheating Supreme Court')..."
            className="w-full py-3.5 pl-3 pr-28 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onSearch("");
              }}
              className="p-1 mr-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center space-x-1.5 pr-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2 rounded text-xs flex items-center space-x-1 transition-colors ${
                showAdvanced || court || act || section || dateFrom
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              title="Toggle Legal Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium">Filters</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Legal Pre-Set Query Pills */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center">
            <Sparkles className="w-3 h-3 text-amber-600 mr-1" /> Quick searches:
          </span>
          <button
            type="button"
            onClick={() => setSampleQuery("IPC Section 420 cheating Supreme Court")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
          >
            IPC Section 420 cheating Supreme Court
          </button>
          <button
            type="button"
            onClick={() => setSampleQuery("Section 438 CrPC anticipatory bail Karnataka High Court")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
          >
            Section 438 CrPC anticipatory bail Karnataka High Court
          </button>
          <button
            type="button"
            onClick={() => setSampleQuery("Section 138 NI Act cheque dishonour")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
          >
            Section 138 NI Act cheque dishonour
          </button>
          <button
            type="button"
            onClick={() => setSampleQuery("Transitional law BNSS Section 531 CrPC 482")}
            className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-medium border border-amber-200 transition-colors"
          >
            Transitional law BNSS Section 531 CrPC 482
          </button>
          <button
            type="button"
            onClick={() => setSampleQuery("2014 INSC 493")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono border border-slate-200 transition-colors"
          >
            Citation: 2014 INSC 493
          </button>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="mt-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Court
              </label>
              <select
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="w-full text-xs p-2 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-600"
              >
                <option value="">All Courts</option>
                <option value="SCI">Supreme Court of India</option>
                <option value="HCKAR">High Court of Karnataka</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Act
              </label>
              <select
                value={act}
                onChange={(e) => setAct(e.target.value)}
                className="w-full text-xs p-2 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-600"
              >
                <option value="">Any Act</option>
                <option value="IPC">Indian Penal Code, 1860 (IPC)</option>
                <option value="CrPC">Code of Criminal Procedure, 1973 (CrPC)</option>
                <option value="BNS">Bharatiya Nyaya Sanhita, 2023 (BNS)</option>
                <option value="BNSS">Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)</option>
                <option value="BSA">Bharatiya Sakshya Adhiniyam, 2023 (BSA)</option>
                <option value="NI Act">Negotiable Instruments Act, 1881</option>
                <option value="Constitution">Constitution of India</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Section / Article
              </label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. 420, 438, 138, 482"
                className="w-full text-xs p-2 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Judgment Date (DD-MM-YYYY)
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From (01-01-2014)"
                  className="w-1/2 text-xs p-2 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-600 font-mono"
                />
                <input
                  type="text"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To (31-12-2024)"
                  className="w-1/2 text-xs p-2 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCourt("");
                  setAct("");
                  setSection("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold"
              >
                Apply Filters & Search
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
