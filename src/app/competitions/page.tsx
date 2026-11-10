"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Tag,
  Archive,
  ArrowUpDown,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate, getRelativeDeadline, getStatusBadgeClass } from "@/lib/utils";
import { CompetitionStatus } from "@/types";

const ALL_STATUSES: CompetitionStatus[] = [
  "Interested",
  "Planning to Apply",
  "Application in Progress",
  "Applied",
  "Registration Confirmed",
  "Shortlisted",
  "Participating",
  "Submission Completed",
  "Finalist",
  "Winner",
  "Not Selected",
  "Withdrawn",
  "Completed",
];

function CompetitionsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { competitions, archiveCompetition } = useAppStore();

  const [search, setSearch] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"deadline" | "updated" | "name">("deadline");

  const filteredCompetitions = useMemo(() => {
    return competitions
      .filter((c) => {
        if (!showArchived && c.archived) return false;
        if (showArchived && !c.archived) return false;

        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (formatFilter !== "all" && c.format !== formatFilter) return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchOrg = c.organizer?.toLowerCase().includes(q);
          const matchCat = c.category?.toLowerCase().includes(q);
          const matchTag = c.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchOrg && !matchCat && !matchTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "updated") {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        // deadline
        const aDeadline = a.dates?.submissionDeadline || a.dates?.registrationCloses || "9999";
        const bDeadline = b.dates?.submissionDeadline || b.dates?.registrationCloses || "9999";
        return new Date(aDeadline).getTime() - new Date(bDeadline).getTime();
      });
  }, [competitions, search, statusFilter, formatFilter, showArchived, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Competitions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track hackathons, coding contests, and challenges across their entire lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              showArchived
                ? "bg-primary-500/10 border-primary-500 text-primary-500"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Archive className="h-4 w-4" />
            <span>{showArchived ? "Showing Archived" : "Show Archived"}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, organizer, category, or tags..."
            className="h-10 w-full rounded-xl border border-input bg-background/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="online">Online</option>
            <option value="offline">Offline / In-person</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:border-primary-500 focus:outline-none"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="updated">Sort: Recently Updated</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid of Competition Cards */}
      {filteredCompetitions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-bold text-foreground">
            No competitions found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || statusFilter !== "all"
              ? "Try adjusting your search query or status filter."
              : "Start by adding your first competition."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompetitions.map((comp) => {
            const deadline = comp.dates?.submissionDeadline || comp.dates?.registrationCloses;
            const rel = getRelativeDeadline(deadline);

            return (
              <div
                key={comp.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 hover:border-primary-500/40 hover:shadow-lg transition-all"
              >
                <div>
                  {/* Status & Format Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${getStatusBadgeClass(
                        comp.status
                      )}`}
                    >
                      {comp.status}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                      {comp.format}
                    </span>
                  </div>

                  {/* Title & Organizer */}
                  <div className="mt-3">
                    <Link
                      href={`/competitions/${comp.id}`}
                      className="text-base font-bold text-foreground hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                    >
                      {comp.name}
                    </Link>
                    {comp.organizer && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {comp.organizer}
                      </p>
                    )}
                  </div>

                  {/* Short Description */}
                  {comp.shortDescription && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {comp.shortDescription}
                    </p>
                  )}

                  {/* Tags */}
                  {comp.tags && comp.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {comp.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                      {comp.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{comp.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Dates & Links */}
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                  {deadline ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <span
                          className={`font-semibold ${
                            rel.isOverdue
                              ? "text-rose-500"
                              : rel.isUrgent
                              ? "text-amber-500"
                              : "text-foreground"
                          }`}
                        >
                          {rel.text}
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-1">
                          ({formatDate(deadline, "MMM d")})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">No deadline set</span>
                  )}

                  <Link
                    href={`/competitions/${comp.id}`}
                    className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 text-xs"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CompetitionsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
          Loading competitions...
        </div>
      }
    >
      <CompetitionsContent />
    </Suspense>
  );
}
