"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  ArrowLeft,
  GitBranch,
  ExternalLink,
  Video,
  FileText,
  Trash2,
  Trophy,
  CheckSquare,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getStatusBadgeClass } from "@/lib/utils";
import { ProjectStatus } from "@/types";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    projects,
    updateProject,
    deleteProject,
    competitions,
    competitionProjectLinks,
    linkProjectToCompetition,
    unlinkProjectFromCompetition,
    tasks,
    addTask,
    toggleTaskDone,
  } = useAppStore();

  const project = projects.find((p) => p.id === resolvedParams.id);

  // Link competition state
  const [selectedCompIdToLink, setSelectedCompIdToLink] = useState("");

  // Quick task state
  const [newTaskTitle, setNewTaskTitle] = useState("");

  if (!project) {
    return (
      <div className="py-16 text-center">
        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-bold">Project not found</h2>
        <Link
          href="/projects"
          className="mt-3 inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
      </div>
    );
  }

  // Linked competitions
  const linkedCompIds = competitionProjectLinks
    .filter((l) => l.projectId === project.id)
    .map((l) => l.competitionId);
  const linkedCompetitions = competitions.filter((c) => linkedCompIds.includes(c.id));
  const availableCompsToLink = competitions.filter((c) => !linkedCompIds.includes(c.id));

  // Project tasks
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  const handleStatusChange = (newStatus: ProjectStatus) => {
    updateProject(project.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
      deleteProject(project.id);
      router.push("/projects");
    }
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      status: "To Do",
      priority: "Medium",
      projectId: project.id,
      tags: [],
    });
    setNewTaskTitle("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          {project.links?.repoUrl && (
            <a
              href={project.links.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Repository</span>
            </a>
          )}
          {project.links?.liveUrl && (
            <a
              href={project.links.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Live Site</span>
            </a>
          )}
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Project Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-semibold border ${getStatusBadgeClass(
                  project.status
                )}`}
              >
                {project.status}
              </span>
              {project.category && (
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {project.category}
                </span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {project.name}
            </h1>

            {project.tagline && (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {project.tagline}
              </p>
            )}

            {/* Tech Stack Chips */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg bg-primary-500/10 px-2.5 py-1 text-xs font-medium text-primary-600 dark:text-primary-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status selector */}
          <div className="shrink-0 rounded-2xl border border-border bg-background/50 p-4 min-w-[200px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Project Lifecycle
            </label>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              className="mt-1.5 h-9 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground focus:border-primary-500 focus:outline-none"
            >
              <option value="Idea">Idea</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Details & Deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Problem & Proposed Solution */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Project Concept</h3>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Problem Statement
            </span>
            <p className="mt-1 text-xs text-foreground leading-relaxed bg-background/50 p-3 rounded-xl border border-border">
              {project.problemStatement || project.description || "No problem statement specified."}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Proposed Solution
            </span>
            <p className="mt-1 text-xs text-foreground leading-relaxed bg-background/50 p-3 rounded-xl border border-border">
              {project.proposedSolution || "No solution description added."}
            </p>
          </div>

          {project.architectureNotes && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Architecture Notes
              </span>
              <p className="mt-1 text-xs text-foreground leading-relaxed bg-background/50 p-3 rounded-xl border border-border font-mono">
                {project.architectureNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right: Deliverables & Links */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Deliverables & Links</h3>
          <div className="space-y-2.5">
            {[
              { label: "Source Repository", url: project.links?.repoUrl, icon: GitBranch },
              { label: "Live Deployment", url: project.links?.liveUrl, icon: ExternalLink },
              { label: "Interactive Demo", url: project.links?.demoUrl, icon: ExternalLink },
              { label: "Pitch / Demo Video", url: project.links?.videoUrl, icon: Video },
              { label: "Presentation Deck / Docs", url: project.links?.docsUrl || project.links?.deckUrl, icon: FileText },
            ].map((link) => (
              <div
                key={link.label}
                className="flex items-center justify-between rounded-xl border border-border p-3 bg-background/50"
              >
                <div className="flex items-center gap-2">
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{link.label}</span>
                </div>
                {link.url ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-primary-500 hover:underline flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Not provided</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Linked Competitions Section */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-indigo-500" />
              <span>Competitions using this Project ({linkedCompetitions.length})</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Link this project to one or multiple competitions without duplicating the codebase.
            </p>
          </div>

          {availableCompsToLink.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedCompIdToLink}
                onChange={(e) => setSelectedCompIdToLink(e.target.value)}
                className="h-9 rounded-xl border border-input bg-background px-3 text-xs"
              >
                <option value="">Select a competition to link...</option>
                {availableCompsToLink.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (selectedCompIdToLink) {
                    linkProjectToCompetition(selectedCompIdToLink, project.id);
                    setSelectedCompIdToLink("");
                  }
                }}
                disabled={!selectedCompIdToLink}
                className="h-9 rounded-xl bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Link
              </button>
            </div>
          )}
        </div>

        {linkedCompetitions.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            This project has not been entered into any competitions yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {linkedCompetitions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border p-3.5 bg-background/50"
              >
                <div>
                  <Link
                    href={`/competitions/${c.id}`}
                    className="font-bold text-xs text-foreground hover:text-primary-600"
                  >
                    {c.name}
                  </Link>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Status: <span className="font-semibold text-foreground">{c.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => unlinkProjectFromCompetition(c.id, project.id)}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Unlink
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Tasks */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-emerald-500" />
          <span>Project Tasks ({projectTasks.length})</span>
        </h3>

        <form onSubmit={handleQuickAddTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add task for this project..."
            className="h-9 flex-1 rounded-xl border border-input bg-background px-3 text-xs focus:border-primary-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700"
          >
            Add Task
          </button>
        </form>

        {projectTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            No specific tasks logged for this project yet.
          </div>
        ) : (
          <div className="space-y-2">
            {projectTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border p-3 bg-background/50"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleTaskDone(t.id)}
                    className="text-muted-foreground hover:text-emerald-500"
                  >
                    <CheckCircle2
                      className={`h-4 w-4 ${
                        t.status === "Done" ? "text-emerald-500" : ""
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-medium ${
                      t.status === "Done"
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {t.title}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
