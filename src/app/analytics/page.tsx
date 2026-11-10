"use client";

import { useMemo } from "react";
import { BarChart3, Trophy, FolderKanban, Award, CheckSquare, Layers } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const { competitions, projects, tasks, results } = useAppStore();

  // Tech stack frequency
  const techFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      p.techStack?.forEach((tech) => {
        counts[tech] = (counts[tech] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  // Competitions by format
  const formatStats = useMemo(() => {
    const formats: Record<string, number> = { online: 0, offline: 0, hybrid: 0 };
    competitions.forEach((c) => {
      formats[c.format] = (formats[c.format] || 0) + 1;
    });
    return formats;
  }, [competitions]);

  // Competitions by status
  const statusStats = useMemo(() => {
    const map: Record<string, number> = {};
    competitions.forEach((c) => {
      map[c.status] = (map[c.status] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [competitions]);

  const wins = results.filter((r) => r.outcome === "Winner").length;
  const finalists = results.filter((r) => r.outcome === "Finalist").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Analytics & Personal History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregated performance insights based on your competitions and project development records.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">Total Participated</span>
          <p className="text-2xl font-bold text-foreground mt-1">{competitions.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">Win & Finalist Rate</span>
          <p className="text-2xl font-bold text-primary-500 mt-1">
            {competitions.length > 0
              ? `${Math.round(((wins + finalists) / competitions.length) * 100)}%`
              : "0%"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">Projects Shipped</span>
          <p className="text-2xl font-bold text-foreground mt-1">{projects.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-xs text-muted-foreground">Task Completion Rate</span>
          <p className="text-2xl font-bold text-emerald-500 mt-1">
            {tasks.length > 0
              ? `${Math.round(
                  (tasks.filter((t) => t.status === "Done").length / tasks.length) * 100
                )}%`
              : "0%"}
          </p>
        </div>
      </div>

      {/* Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Used Technologies */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary-500" />
            <span>Top Tech Stacks in Projects</span>
          </h3>
          <div className="space-y-3">
            {techFrequency.slice(0, 6).map(([tech, count]) => {
              const maxCount = techFrequency[0] ? techFrequency[0][1] : 1;
              const percent = Math.round((count / maxCount) * 100);

              return (
                <div key={tech} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-foreground">{tech}</span>
                    <span className="text-muted-foreground">{count} project(s)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-600 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Competitions by Lifecycle */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span>Competitions by Lifecycle Status</span>
          </h3>
          <div className="space-y-2.5">
            {statusStats.map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-xl border border-border p-3 bg-background/50"
              >
                <span className="text-xs font-medium text-foreground">{status}</span>
                <span className="text-xs font-bold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
