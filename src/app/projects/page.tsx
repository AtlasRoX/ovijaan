"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  ExternalLink,
  Plus,
  GitBranch,
  Layers,
  Archive,
  Trophy,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate, getStatusBadgeClass } from "@/lib/utils";
import { ProjectStatus } from "@/types";

const ALL_PROJECT_STATUSES: ProjectStatus[] = [
  "Idea",
  "Planned",
  "In Progress",
  "On Hold",
  "Completed",
  "Archived",
];

export default function ProjectsPage() {
  const { projects, competitionProjectLinks, competitions } = useAppStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (!showArchived && p.status === "Archived") return false;
      if (showArchived && p.status !== "Archived") return false;

      if (statusFilter !== "all" && p.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchTagline = p.tagline?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchStack = p.techStack?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchTagline && !matchDesc && !matchStack) return false;
      }

      return true;
    });
  }, [projects, search, statusFilter, showArchived]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your independent projects, ideas, deliverables, and competition connections.
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

      {/* Search & Status Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, description, or tech stack..."
            className="h-10 w-full rounded-xl border border-input bg-background/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-medium focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {ALL_PROJECT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-bold text-foreground">
            No projects found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start by adding a new project or adjusting your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const linkedCompCount = competitionProjectLinks.filter(
              (l) => l.projectId === project.id
            ).length;

            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 hover:border-primary-500/40 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${getStatusBadgeClass(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                    {linkedCompCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        <Trophy className="h-3 w-3" />
                        <span>{linkedCompCount} Comp{linkedCompCount > 1 ? "s" : ""}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-base font-bold text-foreground hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                    >
                      {project.name}
                    </Link>
                    {project.tagline && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {project.tagline}
                      </p>
                    )}
                  </div>

                  {/* Tech stack */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {project.links?.repoUrl && (
                      <a
                        href={project.links.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        title="Repository"
                      >
                        <GitBranch className="h-4 w-4" />
                      </a>
                    )}
                    {project.links?.liveUrl && (
                      <a
                        href={project.links.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                        title="Live Deployment"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    View Project →
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
