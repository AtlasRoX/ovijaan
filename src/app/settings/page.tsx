"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RefreshCw,
  Sun,
  Moon,
  Shield,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api-client";

export default function SettingsPage() {
  const {
    user,
    setUser,
    theme,
    setTheme,
    exportJSON,
    importJSON,
    exportCSV,
    clearAllUserData,
  } = useAppStore();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || "USD");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      uid: user?.uid || "demo-user",
      email: user?.email || "user@obhijaan.app",
      displayName: displayName.trim(),
      preferredCurrency,
    });
    alert("Profile settings updated!");
  };

  const handleDownloadJSON = () => {
    const dataStr = exportJSON();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `obhijaan-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = (type: "competitions" | "projects" | "tasks") => {
    const csvStr = exportCSV(type);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `obhijaan-${type}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importJSON(content);
      if (success) {
        setImportStatus("Backup successfully restored!");
      } else {
        setImportStatus("Failed to restore: Invalid backup JSON structure.");
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure? This will permanently delete all your competitions, projects, tasks, and achievements.")) {
      clearAllUserData();
      alert("All records have been cleared.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Settings & Data Portability
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account management, workspace preferences, and full data backups.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Profile & Currency</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Preferred Currency</label>
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="BDT">BDT (৳)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
        >
          Save Changes
        </button>
      </form>

      {/* Theme Selection */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground">Appearance</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
              theme === "dark"
                ? "bg-primary-500/10 border-primary-500 text-primary-500"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Dark Theme</span>
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
              theme === "light"
                ? "bg-primary-500/10 border-primary-500 text-primary-500"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Light Theme</span>
          </button>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Data Export & Backup</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Preserve complete ownership of your data with JSON and CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON Full Backup</span>
          </button>
          <button
            onClick={() => handleDownloadCSV("competitions")}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
            <span>Export Competitions CSV</span>
          </button>
          <button
            onClick={() => handleDownloadCSV("projects")}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-blue-500" />
            <span>Export Projects CSV</span>
          </button>
          <button
            onClick={() => handleDownloadCSV("tasks")}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-amber-500" />
            <span>Export Tasks CSV</span>
          </button>
        </div>

        <div className="pt-3 border-t border-border">
          <h4 className="text-xs font-bold text-foreground mb-2">Restore Backup</h4>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="text-xs text-muted-foreground file:mr-3 file:rounded-xl file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold hover:file:bg-card"
          />
          {importStatus && (
            <p className="mt-2 text-xs font-medium text-primary-500">{importStatus}</p>
          )}
        </div>
      </div>

      {/* Account Session & Sign Out */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Active Session</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Signed in as <span className="font-semibold text-foreground">{user?.email || user?.displayName || "Competitor"}</span>
          </p>
        </div>
        <button
          onClick={() => {
            setUser(null);
            apiClient.auth.logout().catch(() => {});
          }}
          className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:text-rose-500 transition"
        >
          Sign Out
        </button>
      </div>

      {/* Danger / Clear Area */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Clear All Workspace Data</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently delete all your competitions, projects, tasks, and files.
          </p>
        </div>
        <button
          onClick={handleClearAllData}
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
        >
          Clear All Records
        </button>
      </div>
    </div>
  );
}
