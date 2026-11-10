"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  Download,
  Trash2,
  Plus,
  Trophy,
  FolderKanban,
  ExternalLink,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { FileCategory } from "@/types";
import { uploadFileToFirebase, isFirebaseConfigured } from "@/lib/firebase";

export default function FilesPage() {
  const { files, deleteFile, addFile, competitions, projects } = useAppStore();
  const [filterCat, setFilterCat] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New file form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileCat, setFileCat] = useState<FileCategory>("Certificate");
  const [fileCompId, setFileCompId] = useState("");
  const [fileProjId, setFileProjId] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!fileName) setFileName(file.name);
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    let finalUrl = fileUrl.trim() || "/logo.png";
    let fileSize = 154000;
    let fileType = "application/pdf";

    if (selectedFile) {
      fileSize = selectedFile.size;
      fileType = selectedFile.type;

      if (isFirebaseConfigured) {
        try {
          setUploadProgress(10);
          const uploadRes = await uploadFileToFirebase(
            selectedFile,
            `vault/${fileCat.toLowerCase()}`,
            (p) => setUploadProgress(p)
          );
          finalUrl = uploadRes.url;
        } catch (err: any) {
          console.warn("Firebase upload failed, saving locally:", err);
          setUploadError("Could not upload to Firebase bucket. Saving locally.");
        } finally {
          setUploadProgress(null);
        }
      }
    }

    addFile({
      name: fileName.trim(),
      category: fileCat,
      size: fileSize,
      type: fileType,
      url: finalUrl,
      relatedCompetitionId: fileCompId || undefined,
      relatedProjectId: fileProjId || undefined,
    });

    setFileName("");
    setFileUrl("");
    setSelectedFile(null);
    setShowAddModal(false);
  };

  const filteredFiles = files.filter(
    (f) => filterCat === "all" || f.category === filterCat
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Files & Document Vault
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Centralized document vault for hackathon certificates, presentation decks, rules, and proofs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Document / Link</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {["all", "Certificate", "Deck", "Registration", "Doc", "Media"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition ${
              filterCat === cat
                ? "bg-primary-600 text-white"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Upload Modal Drawer */}
      {showAddModal && (
        <form
          onSubmit={handleAddFile}
          className="rounded-2xl border border-primary-500/30 bg-card p-5 space-y-3 animate-fade-in"
        >
          <h3 className="text-sm font-bold text-foreground">Add Document or Asset Link</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">File / Document Name *</label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Champion_Certificate.pdf"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Category</label>
              <select
                value={fileCat}
                onChange={(e) => setFileCat(e.target.value as FileCategory)}
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="Certificate">Certificate</option>
                <option value="Deck">Pitch Deck / Presentation</option>
                <option value="Registration">Registration Confirmation</option>
                <option value="Doc">Document / Paper</option>
                <option value="Media">Media / Screenshots</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Relate to Competition</label>
              <select
                value={fileCompId}
                onChange={(e) => setFileCompId(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Relate to Project</label>
              <select
                value={fileProjId}
                onChange={(e) => setFileProjId(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Select File from Device</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-xl file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold hover:file:bg-card"
            />
            {uploadProgress !== null && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-primary-500">
                  <span>Uploading to Firebase Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Or External File / Asset URL</label>
            <input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://... or leave blank if file picked above"
              className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
            >
              Save File
            </button>
          </div>
        </form>
      )}

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-base font-bold text-foreground">No files in your vault</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Upload certificates, slide decks, and registration proofs directly from your device.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
          const comp = competitions.find((c) => c.id === file.relatedCompetitionId);
          const proj = projects.find((p) => p.id === file.relatedProjectId);

          return (
            <div
              key={file.id}
              className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between hover:border-primary-500/30 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-primary-500/10 p-2.5 text-primary-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="p-1 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3">
                  <h3 className="font-bold text-sm text-foreground truncate">{file.name}</h3>
                  <span className="inline-block mt-1 rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {file.category}
                  </span>
                </div>

                {comp && (
                  <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-indigo-500" />
                    <span className="truncate">{comp.name}</span>
                  </p>
                )}
                {proj && (
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <FolderKanban className="h-3 w-3 text-blue-500" />
                    <span className="truncate">{proj.name}</span>
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{formatDate(file.createdAt)}</span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary-500 hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>View / Download</span>
                </a>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
