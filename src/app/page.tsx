"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Trophy,
  FolderKanban,
  CheckSquare,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  Plus,
  ExternalLink,
  Calendar as CalendarIcon,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  formatDate,
  getRelativeDeadline,
  formatCurrency,
  getStatusBadgeClass,
} from "@/lib/utils";
import confetti from "canvas-confetti";

export default function DashboardPage() {
  const {
    competitions,
    projects,
    tasks,
    results,
    activityLogs,
    toggleTaskDone,
  } = useAppStore();

  // Active items
  const activeCompetitions = competitions.filter(
    (c) =>
      !c.archived &&
      ["Interested", "Planning to Apply", "Application in Progress", "Applied", "Registration Confirmed", "Shortlisted", "Participating", "Submission Completed"].includes(
        c.status
      )
  );

  const activeProjects = projects.filter(
    (p) => p.status === "In Progress" || p.status === "Planned"
  );

  const pendingTasks = tasks.filter(
    (t) => t.status !== "Done" && t.status !== "Cancelled"
  );

  // Upcoming deadlines collected across all competitions and milestones
  const allDeadlines: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    competitionId?: string;
    projectId?: string;
  }> = [];

  competitions.forEach((c) => {
    if (c.archived) return;
    if (c.dates?.registrationCloses) {
      allDeadlines.push({
        id: `${c.id}-reg`,
        title: `${c.name} (Registration)`,
        type: "Registration",
        date: c.dates.registrationCloses,
        competitionId: c.id,
      });
    }
    if (c.dates?.submissionDeadline) {
      allDeadlines.push({
        id: `${c.id}-sub`,
        title: `${c.name} (Submission)`,
        type: "Submission Deadline",
        date: c.dates.submissionDeadline,
        competitionId: c.id,
      });
    }
    if (c.dates?.presentationDate) {
      allDeadlines.push({
        id: `${c.id}-pres`,
        title: `${c.name} (Presentation)`,
        type: "Judging / Presentation",
        date: c.dates.presentationDate,
        competitionId: c.id,
      });
    }
    if (c.dates?.resultDate) {
      allDeadlines.push({
        id: `${c.id}-res`,
        title: `${c.name} (Results)`,
        type: "Results Announcement",
        date: c.dates.resultDate,
        competitionId: c.id,
      });
    }
  });

  // Sort upcoming deadlines nearest first
  const sortedDeadlines = allDeadlines
    .map((item) => ({ ...item, rel: getRelativeDeadline(item.date) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  // Attention needed: Overdue tasks and urgent deadlines (<= 3 days)
  const overdueTasks = tasks.filter((t) => {
    if (t.status === "Done" || t.status === "Cancelled" || !t.dueDate) return false;
    return getRelativeDeadline(t.dueDate).isOverdue;
  });

  const urgentDeadlines = sortedDeadlines.filter(
    (d) => d.rel.isUrgent || d.rel.isOverdue
  );

  // Achievements calculation
  const winsCount = results.filter((r) => r.outcome === "Winner").length;
  const finalistsCount = results.filter((r) => r.outcome === "Finalist").length;

  // Group prize money by currency
  const prizesByCurrency = results.reduce<Record<string, number>>((acc, curr) => {
    if (curr.prizeAmount && curr.prizeCurrency) {
      const cur = curr.prizeCurrency.toUpperCase();
      acc[cur] = (acc[cur] || 0) + curr.prizeAmount;
    }
    return acc;
  }, {});

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Workspace Overview
            </h1>
            <span className="rounded-full bg-primary-500/10 px-2.5 py-0.5 text-xs font-semibold text-primary-600 dark:text-primary-400">
              OBHIJAAN
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Centralized source of truth for your competitions, active builds, and accomplishments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            <Trophy className="h-4 w-4 text-indigo-500" />
            <span>View Competitions</span>
          </Link>
          <button
            onClick={handleCelebrate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>Celebrate Wins</span>
          </button>
        </div>
      </div>

      {/* Attention Needed Banner (if any) */}
      {(overdueTasks.length > 0 || urgentDeadlines.length > 0) && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-rose-500/15 p-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Action Required
              </h3>
              <p className="mt-0.5 text-xs text-rose-700/80 dark:text-rose-300/80">
                You have {overdueTasks.length} overdue task(s) and {urgentDeadlines.length} critical upcoming deadline(s).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {urgentDeadlines.map((d) => (
                  <Link
                    key={d.id}
                    href={d.competitionId ? `/competitions/${d.competitionId}` : "#"}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-card/80 border border-rose-500/30 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-card transition"
                  >
                    <span className="font-semibold">{d.title}:</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      {d.rel.text}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Competitions */}
        <Link
          href="/competitions"
          className="group rounded-2xl border border-border bg-card p-4 hover:border-primary-500/40 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Contests</span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {activeCompetitions.length}
            </span>
            <span className="text-xs text-muted-foreground">
              of {competitions.length} total
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">In application or live</p>
        </Link>

        {/* Card 2: Active Projects */}
        <Link
          href="/projects"
          className="group rounded-2xl border border-border bg-card p-4 hover:border-primary-500/40 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Projects</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
              <FolderKanban className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {activeProjects.length}
            </span>
            <span className="text-xs text-muted-foreground">
              of {projects.length} total
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Planned or building</p>
        </Link>

        {/* Card 3: Pending Tasks */}
        <Link
          href="/tasks"
          className="group rounded-2xl border border-border bg-card p-4 hover:border-primary-500/40 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Tasks</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : "on track"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Across all projects</p>
        </Link>

        {/* Card 4: Accomplishments */}
        <Link
          href="/achievements"
          className="group rounded-2xl border border-border bg-card p-4 hover:border-primary-500/40 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Wins & Awards</span>
            <div className="rounded-xl bg-amber-500/15 p-2 text-amber-500 group-hover:scale-105 transition-transform">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {winsCount + finalistsCount}
            </span>
            <span className="text-xs text-muted-foreground">
              {winsCount} win{winsCount !== 1 ? "s" : ""}, {finalistsCount} finalist{finalistsCount !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            {Object.entries(prizesByCurrency).length > 0
              ? Object.entries(prizesByCurrency)
                  .map(([c, val]) => `${formatCurrency(val, c)}`)
                  .join(" + ")
              : "Track podium finishes"}
          </p>
        </Link>
      </div>

      {/* Main Grid: Upcoming Deadlines & Active Competitions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Active Competitions & In-Progress Projects */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Competitions Section */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary-500" />
                <h2 className="text-base font-bold text-foreground">
                  Active Competitions
                </h2>
              </div>
              <Link
                href="/competitions"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {activeCompetitions.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active competitions right now. Click "Quick Create" to add one!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activeCompetitions.map((comp) => {
                  const deadline = comp.dates?.submissionDeadline || comp.dates?.registrationCloses;
                  const rel = getRelativeDeadline(deadline);

                  return (
                    <div
                      key={comp.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/competitions/${comp.id}`}
                            className="font-semibold text-sm text-foreground hover:text-primary-600 dark:hover:text-primary-400 truncate"
                          >
                            {comp.name}
                          </Link>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${getStatusBadgeClass(
                              comp.status
                            )}`}
                          >
                            {comp.status}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {comp.organizer && <span>{comp.organizer}</span>}
                          <span>•</span>
                          <span className="capitalize">{comp.format}</span>
                          {comp.participation?.prizePool && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 dark:text-amber-400">
                                {comp.participation.prizePool}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {deadline && (
                        <div className="flex items-center gap-2 sm:text-right shrink-0">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground sm:hidden" />
                          <div>
                            <p
                              className={`text-xs font-semibold ${
                                rel.isOverdue
                                  ? "text-rose-500"
                                  : rel.isUrgent
                                  ? "text-amber-500"
                                  : "text-foreground"
                              }`}
                            >
                              {rel.text}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {formatDate(deadline, "MMM d")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Projects Section */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-500" />
                <h2 className="text-base font-bold text-foreground">
                  Projects in Development
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {activeProjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active projects in progress.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-xl border border-border p-3.5 hover:border-primary-500/30 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/projects/${proj.id}`}
                          className="font-bold text-sm text-foreground hover:text-primary-600 dark:hover:text-primary-400 truncate"
                        >
                          {proj.name}
                        </Link>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${getStatusBadgeClass(
                            proj.status
                          )}`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {proj.tagline || proj.description || "No description provided"}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {proj.techStack?.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      {proj.links?.repoUrl && (
                        <a
                          href={proj.links.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Deadlines & Priority Tasks */}
        <div className="space-y-6">
          {/* Nearest Deadlines Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <h2 className="text-base font-bold text-foreground">
                  Upcoming Deadlines
                </h2>
              </div>
              <Link
                href="/calendar"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <span>Calendar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {sortedDeadlines.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No upcoming dates recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border/80 bg-background/50 p-3 hover:bg-muted/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {item.type}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          item.rel.isOverdue
                            ? "text-rose-500"
                            : item.rel.isUrgent
                            ? "text-amber-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.rel.text}
                      </span>
                    </div>
                    <Link
                      href={item.competitionId ? `/competitions/${item.competitionId}` : "#"}
                      className="mt-1 block text-xs font-semibold text-foreground hover:text-primary-600 truncate"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatDate(item.date, "EEEE, MMM d, yyyy")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Tasks Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-emerald-500" />
                <h2 className="text-base font-bold text-foreground">
                  Next Tasks
                </h2>
              </div>
              <Link
                href="/tasks"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                All tasks completed! Great job.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-background/50 p-2.5 hover:bg-muted/40 transition"
                  >
                    <button
                      onClick={() => toggleTaskDone(t.id)}
                      className="mt-0.5 text-muted-foreground hover:text-emerald-500 transition"
                      aria-label="Toggle task status"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          t.status === "Done" ? "text-emerald-500" : ""
                        }`}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">
                        {t.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px]">
                        <span
                          className={`rounded px-1.5 py-0.2 font-semibold ${getStatusBadgeClass(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                        {t.dueDate && (
                          <span className="text-muted-foreground">
                            Due {formatDate(t.dueDate, "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
