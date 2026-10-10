"use client";

import React, { useState, useEffect } from "react";
import {
  FolderCheck,
  FolderPlus,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  Printer,
  ChevronRight,
} from "lucide-react";
import { UserSession } from "@/lib/types";

interface ResearchFoldersViewProps {
  currentUser: UserSession | null;
  onOpenAuth: () => void;
  onOpenJudgment: (id: string) => void;
}

export const ResearchFoldersView: React.FC<ResearchFoldersViewProps> = ({
  currentUser,
  onOpenAuth,
  onOpenJudgment,
}) => {
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [newClientRef, setNewClientRef] = useState("");

  const loadFolders = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await fetch("/api/folders");
      const json = await res.json();
      setFolders(json.folders || []);

      if (json.folders && json.folders.length > 0 && !selectedFolder) {
        loadFolderDetails(json.folders[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadFolderDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/folders?id=${id}`);
      const json = await res.json();
      setSelectedFolder(json.folder);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadFolders();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_folder",
          name: newFolderName.trim(),
          description: newFolderDesc.trim() || null,
          clientReference: newClientRef.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewFolderName("");
        setNewFolderDesc("");
        setNewClientRef("");
        loadFolders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveItem = async (judgmentId: string) => {
    if (!selectedFolder) return;
    try {
      await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_judgment",
          folderId: selectedFolder.id,
          judgmentId,
        }),
      });
      loadFolderDetails(selectedFolder.id);
    } catch (e) {
      console.error(e);
    }
  };

  const exportFolderToCsv = () => {
    if (!selectedFolder || !selectedFolder.items) return;
    let csv = "Case Title,Court,Case Number,Judgment Date,Citation,My Practice Notes\n";
    selectedFolder.items.forEach((it: any) => {
      const j = it.judgment;
      const title = `"${j.title.replace(/"/g, '""')}"`;
      const court = `"${j.court.name}"`;
      const caseNo = `"${j.caseNumber}"`;
      const date = `"${j.formattedDate}"`;
      const cit = `"${j.reportedCitation || j.neutralCitation || ""}"`;
      const notes = `"${(it.userNotes || "").replace(/"/g, '""')}"`;
      csv += `${title},${court},${caseNo},${date},${cit},${notes}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${selectedFolder.name.replace(/\s+/g, "_")}_Research.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 space-y-3">
        <FolderCheck className="w-10 h-10 text-amber-700 mx-auto" />
        <h2 className="text-base font-bold text-slate-800 font-serif">
          Advocate Sign-In Required
        </h2>
        <p className="text-xs text-slate-500">
          Sign in with your advocate credentials to access private case research folders and client matter dossiers.
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
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-slate-900 font-serif flex items-center space-x-2">
            <FolderCheck className="w-4 h-4 text-blue-700" />
            <span>Case Research Folders & Brief Dossiers</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Private legal research collections organized by client matters and upcoming court hearings.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold flex items-center space-x-1 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Research Folder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Folders List (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm h-fit space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 px-2 py-1 border-b border-slate-100">
            My Folders ({folders.length})
          </div>

          <div className="space-y-1">
            {folders.map((f) => {
              const isSelected = selectedFolder?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => loadFolderDetails(f.id)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-950 font-bold border border-blue-300"
                      : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="truncate">{f.name}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>{f.itemCount} authorities</span>
                    {f.clientReference && <span>{f.clientReference}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Folder Items & Export (3 Cols) */}
        <div className="md:col-span-3 space-y-4">
          {selectedFolder ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-serif">
                    {selectedFolder.name}
                  </h2>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    {selectedFolder.clientReference && (
                      <span className="font-semibold text-slate-700">
                        Matter: {selectedFolder.clientReference}
                      </span>
                    )}
                    <span>&bull;</span>
                    <span>{selectedFolder.items?.length || 0} Saved Judgments</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={exportFolderToCsv}
                    className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 hover:bg-slate-50 flex items-center space-x-1.5 text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 hover:bg-slate-50 flex items-center space-x-1.5 text-slate-700"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Dossier</span>
                  </button>
                </div>
              </div>

              {selectedFolder.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedFolder.description}
                </p>
              )}

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {selectedFolder.items?.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No judgments saved in this folder yet. Use &ldquo;Save to Case Folder&rdquo; from any judgment page.
                  </div>
                ) : (
                  selectedFolder.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="py-3.5 hover:bg-slate-50/80 px-2 rounded-lg transition-colors flex items-start justify-between group"
                    >
                      <div
                        onClick={() => onOpenJudgment(item.judgment.id)}
                        className="cursor-pointer flex-1 pr-4"
                      >
                        <div className="flex items-center space-x-2 text-[11px] mb-1">
                          <span
                            className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                              item.judgment.court.code === "SCI"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {item.judgment.court.name}
                          </span>
                          <span className="font-mono text-slate-500">
                            {item.judgment.formattedDate}
                          </span>
                          {item.judgment.neutralCitation && (
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded">
                              {item.judgment.neutralCitation}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors font-serif">
                          {item.judgment.title}
                        </h3>

                        {item.userNotes && (
                          <div className="text-[11px] text-amber-950 bg-amber-50/80 p-2 rounded mt-1.5 border border-amber-200">
                            <span className="font-semibold">Practice Note:</span> {item.userNotes}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.judgment.id)}
                        title="Remove from folder"
                        className="p-1.5 text-slate-300 hover:text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select or create a folder on the left to view saved authorities.
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFolder}
            className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-3 animate-in zoom-in-95"
          >
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              Create New Research Folder
            </h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Folder Name
              </label>
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Regular Bail Roster - Bengaluru Bench"
                className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Client / Brief Reference
              </label>
              <input
                type="text"
                value={newClientRef}
                onChange={(e) => setNewClientRef(e.target.value)}
                placeholder="e.g. Ramesh vs State of Karnataka (Cr.P. 2026)"
                className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Description
              </label>
              <textarea
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="Key statutory grounds, propositions to establish..."
                rows={2}
                className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
