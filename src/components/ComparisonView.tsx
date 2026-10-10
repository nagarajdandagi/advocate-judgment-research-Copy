"use client";

import React from "react";
import { Columns, ArrowLeftRight, X, Building2, Scale, ExternalLink } from "lucide-react";
import { JudgmentSummary } from "@/lib/types";

interface ComparisonViewProps {
  selectedJudgments: any[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenJudgment: (id: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  selectedJudgments,
  onRemove,
  onClear,
  onOpenJudgment,
}) => {
  if (selectedJudgments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8 space-y-3">
        <Columns className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="text-base font-bold text-slate-800 font-serif">
          No Judgments Selected for Comparison
        </h2>
        <p className="text-xs text-slate-500">
          Click the &ldquo;Compare&rdquo; button on any two search results or judgment pages to analyze their facts, holdings, and statutory interpretations side-by-side.
        </p>
      </div>
    );
  }

  const j1 = selectedJudgments[0];
  const j2 = selectedJudgments[1];

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 font-serif flex items-center space-x-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-700" />
            <span>Side-by-Side Judicial Authority Comparison</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare legal principles, bench classifications, and statutory applications between courts.
          </p>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-red-600 hover:underline font-semibold"
        >
          Clear Comparison
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[j1, j2].map((judgment, idx) => {
          if (!judgment) {
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400"
              >
                Select a second judgment from search results to complete comparison.
              </div>
            );
          }

          return (
            <div
              key={judgment.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    judgment.court.code === "SCI"
                      ? "bg-amber-100 text-amber-950 border border-amber-300"
                      : "bg-blue-100 text-blue-950 border border-blue-300"
                  }`}
                >
                  {judgment.court.name}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenJudgment(judgment.id)}
                    className="text-xs text-amber-800 font-semibold hover:underline"
                  >
                    Open Workspace &rarr;
                  </button>
                  <button
                    onClick={() => onRemove(judgment.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif leading-snug">
                  {judgment.title}
                </h2>
                <div className="text-xs font-mono text-slate-500 mt-1">
                  {judgment.neutralCitation || judgment.reportedCitation || judgment.caseNumber}
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    Date & Coram:
                  </span>
                  <div>{judgment.formattedDate}</div>
                  <div className="text-slate-600">{judgment.benchName}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    Statutory Provisions:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {judgment.sections?.map((s: any, i: number) => (
                      <span
                        key={i}
                        className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200"
                      >
                        {s.actShortName} Sec. {s.sectionNumber}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    Headnote / Core Legal Holding:
                  </span>
                  <p className="font-serif leading-relaxed text-slate-800">
                    {judgment.headnote || "Verified official court record."}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1">
                    Precedential Status:
                  </span>
                  <span className="font-bold text-emerald-800">
                    {judgment.precedentialStatus}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
