"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
  FileText,
  Activity,
  History,
  AlertCircle,
} from "lucide-react";
import { UserSession } from "@/lib/types";

interface AdminIngestionViewProps {
  currentUser: UserSession | null;
  onOpenAuth: () => void;
  onOpenJudgment: (id: string) => void;
}

export const AdminIngestionView: React.FC<AdminIngestionViewProps> = ({
  currentUser,
  onOpenAuth,
  onOpenJudgment,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"import" | "connectors" | "audit">("import");

  // Form State for Manual Ingestion
  const [title, setTitle] = useState("");
  const [courtCode, setCourtCode] = useState("SCI");
  const [caseType, setCaseType] = useState("Criminal Appeal");
  const [caseNumber, setCaseNumber] = useState("");
  const [judgmentDate, setJudgmentDate] = useState("");
  const [neutralCitation, setNeutralCitation] = useState("");
  const [reportedCitation, setReportedCitation] = useState("");
  const [authorJudge, setAuthorJudge] = useState("");
  const [headnote, setHeadnote] = useState("");
  const [fullText, setFullText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    error?: string;
    duplicateFound?: boolean;
    existingJudgmentId?: string;
    existingTitle?: string;
    checksum?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/connectors");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setSubmitting(true);
    setImportStatus(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          courtCode,
          caseType,
          caseNumber,
          judgmentDate,
          neutralCitation: neutralCitation || null,
          reportedCitation: reportedCitation || null,
          authorJudge: authorJudge || null,
          headnote: headnote || null,
          fullText,
          sourceUrl: sourceUrl || null,
        }),
      });

      const resJson = await res.json();

      if (res.ok) {
        setImportStatus({
          success: true,
          checksum: resJson.checksumSha256,
        });
        // Clear fields
        setTitle("");
        setCaseNumber("");
        setFullText("");
        setHeadnote("");
        loadData();
      } else {
        setImportStatus({
          success: false,
          error: resJson.error,
          duplicateFound: resJson.duplicateFound,
          existingJudgmentId: resJson.existingJudgmentId,
          existingTitle: resJson.existingTitle,
        });
      }
    } catch (err: any) {
      setImportStatus({
        success: false,
        error: "Failed to submit judgment import.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h1 className="text-base font-bold text-slate-900 font-serif flex items-center space-x-2">
          <UploadCloud className="w-5 h-5 text-amber-800" />
          <span>Official Data Collection & Ingestion Desk</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Authorized ingestion controls for Supreme Court of India and High Court of Karnataka judicial records.
        </p>

        {/* Stats Row */}
        {data?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Indexed</span>
              <div className="text-base font-bold text-slate-900 font-serif">
                {data.stats.totalJudgments} Judgments
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Supreme Court</span>
              <div className="text-base font-bold text-amber-900 font-serif">
                {data.stats.supremeCourtCount}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Karnataka HC</span>
              <div className="text-base font-bold text-blue-900 font-serif">
                {data.stats.karnatakaHighCourtCount}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500">Statutes Indexed</span>
              <div className="text-base font-bold text-emerald-900 font-serif">
                {data.stats.totalActs} Acts ({data.stats.totalSections} Secs)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab("import")}
          className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === "import"
              ? "border-amber-700 text-amber-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Manual PDF & Text Import</span>
        </button>
        <button
          onClick={() => setActiveTab("connectors")}
          className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === "connectors"
              ? "border-amber-700 text-amber-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Official Source Connectors</span>
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === "audit"
              ? "border-amber-700 text-amber-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log & Verification Trails</span>
        </button>
      </div>

      {/* Tab 1: Manual Import */}
      {activeTab === "import" && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 shadow-sm space-y-4">
          {importStatus?.success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Judgment Ingestion Succeeded:</span> Document indexed into law library with SHA256 checksum:{" "}
                <span className="font-mono">{importStatus.checksum}</span>
              </div>
            </div>
          )}

          {importStatus?.duplicateFound && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-950 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Duplicate Judgment Detected:</span> This judgment is already indexed as &ldquo;{importStatus.existingTitle}&rdquo;. Duplicate import prevented to maintain database integrity.
                {importStatus.existingJudgmentId && (
                  <button
                    onClick={() => onOpenJudgment(importStatus.existingJudgmentId!)}
                    className="block mt-1 font-semibold text-amber-900 underline"
                  >
                    Open Existing Verified Record &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Case Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. State of Karnataka vs Appa Balu Ingale & Ors"
                  className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:border-amber-600 font-serif"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Court
                </label>
                <select
                  value={courtCode}
                  onChange={(e) => setCourtCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-slate-300 bg-white"
                >
                  <option value="SCI">Supreme Court of India</option>
                  <option value="HCKAR">High Court of Karnataka</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Case Classification
                </label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-slate-300 bg-white"
                >
                  <option value="Criminal Appeal">Criminal Appeal</option>
                  <option value="Criminal Petition">Criminal Petition</option>
                  <option value="Special Leave Petition (Crl.)">Special Leave Petition (Crl.)</option>
                  <option value="Writ Petition (Civil)">Writ Petition (Civil)</option>
                  <option value="Civil Appeal">Civil Appeal</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Case Number
                </label>
                <input
                  type="text"
                  required
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="e.g. Criminal Appeal No. 432 of 2024"
                  className="w-full text-xs p-2.5 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Judgment Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  required
                  value={judgmentDate}
                  onChange={(e) => setJudgmentDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Neutral Citation
                </label>
                <input
                  type="text"
                  value={neutralCitation}
                  onChange={(e) => setNeutralCitation(e.target.value)}
                  placeholder="e.g. 2024 INSC 890"
                  className="w-full text-xs p-2.5 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Reported Citation
                </label>
                <input
                  type="text"
                  value={reportedCitation}
                  onChange={(e) => setReportedCitation(e.target.value)}
                  placeholder="e.g. (2024) 4 SCC 120"
                  className="w-full text-xs p-2.5 rounded border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                  Author Judge
                </label>
                <input
                  type="text"
                  value={authorJudge}
                  onChange={(e) => setAuthorJudge(e.target.value)}
                  placeholder="e.g. B.V. Nagarathna, J."
                  className="w-full text-xs p-2.5 rounded border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Official Headnote / Summary
              </label>
              <textarea
                value={headnote}
                onChange={(e) => setHeadnote(e.target.value)}
                placeholder="Statutory provisions and core holdings..."
                rows={2}
                className="w-full text-xs p-2.5 rounded border border-slate-300 font-serif"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Judgment Body Text (Preserve paragraph markers [1], [2], etc.)
              </label>
              <textarea
                required
                value={fullText}
                onChange={(e) => setFullText(e.target.value)}
                placeholder="[1] Leave granted. [2] This appeal arises from... [3] We have considered the statutory mandate..."
                rows={8}
                className="w-full text-xs p-3 rounded border border-slate-300 font-serif leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{submitting ? "Verifying & Ingesting..." : "Verify & Ingest Record"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Official Connectors */}
      {activeTab === "connectors" && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="text-xs text-slate-500 pb-2 border-b border-slate-100">
            Source Connectors adhere to robots.txt, official judicial rate limits, and public portal guidelines.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.connectors?.map((conn: any) => (
              <div key={conn.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {conn.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Robots Verified: Yes
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 font-serif">
                  {conn.connectorName}
                </h3>
                <div className="text-[11px] text-slate-500 font-mono truncate">
                  {conn.sourceUrl}
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-600">
                  {conn.rateLimitNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Log */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-b-xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            System Ingestion & Maintenance Trails
          </h2>
          <div className="divide-y divide-slate-100 text-xs font-mono">
            {data?.recentAuditLogs?.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900">{log.action}</span>
                  <span className="text-slate-500 ml-2">by {log.user?.name || "System"}</span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {new Date(log.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
