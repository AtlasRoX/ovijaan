"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Trophy,
  FolderKanban,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  formatDate,
  getRelativeDeadline,
  getStatusBadgeClass,
} from "@/lib/utils";
import { TaskStatus, TaskPriority } from "@/types";

export default function TasksPage() {
  const {
    tasks,
    competitions,
    projects,
    addTask,
    updateTask,
    toggleTaskDone,
    deleteTask,
  } = useAppStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [compFilter, setCompFilter] = useState<string>("all");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // New task inline state
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("Medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newCompId, setNewCompId] = useState("");
  const [newProjId, setNewProjId] = useState("");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      status: "To Do",
      priority: newPriority,
      dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      competitionId: newCompId || undefined,
      projectId: newProjId || undefined,
      tags: [],
    });

    setNewTitle("");
    setNewDueDate("");
    setNewCompId("");
    setNewProjId("");
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (compFilter !== "all" && t.competitionId !== compFilter) return false;

      if (showOverdueOnly) {
        if (t.status === "Done" || t.status === "Cancelled" || !t.dueDate) return false;
        if (!getRelativeDeadline(t.dueDate).isOverdue) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Done items at the bottom
      if (a.status === "Done" && b.status !== "Done") return 1;
      if (a.status !== "Done" && b.status === "Done") return -1;
      // Due date first
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, search, statusFilter, priorityFilter, compFilter, showOverdueOnly]);

  const pendingCount = tasks.filter((t) => t.status !== "Done" && t.status !== "Cancelled").length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Tasks & Actions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Unified actionable checklist across all competitions, milestones, and projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold">
            {pendingCount} Pending • {doneCount} Completed
          </span>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <form onSubmit={handleCreateTask} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done next? (e.g. record walkthrough video, submit devpost form)..."
              className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Priority */}
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
            >
              <option value="Low">Priority: Low</option>
              <option value="Medium">Priority: Medium</option>
              <option value="High">Priority: High</option>
              <option value="Urgent">Priority: Urgent</option>
            </select>

            {/* Due date */}
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
            />

            {/* Link competition */}
            <select
              value={newCompId}
              onChange={(e) => setNewCompId(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs max-w-[160px] truncate"
            >
              <option value="">No Competition</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  Comp: {c.name}
                </option>
              ))}
            </select>

            {/* Link project */}
            <select
              value={newProjId}
              onChange={(e) => setNewProjId(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs max-w-[160px] truncate"
            >
              <option value="">No Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  Project: {p.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="h-9 w-full rounded-xl border border-input bg-background/50 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-2.5 text-xs font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            className={`h-9 rounded-xl border px-3 text-xs font-semibold transition ${
              showOverdueOnly
                ? "bg-rose-500/10 border-rose-500 text-rose-500"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Overdue Only
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No tasks match your active filters.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTasks.map((task) => {
              const rel = getRelativeDeadline(task.dueDate);
              const comp = competitions.find((c) => c.id === task.competitionId);
              const proj = projects.find((p) => p.id === task.projectId);

              return (
                <div
                  key={task.id}
                  className={`flex items-start justify-between gap-3 p-4 transition hover:bg-muted/30 ${
                    task.status === "Done" ? "bg-muted/10 opacity-70" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleTaskDone(task.id)}
                      className="mt-0.5 text-muted-foreground hover:text-emerald-500 transition"
                      aria-label="Toggle task completion"
                    >
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          task.status === "Done" ? "text-emerald-500" : ""
                        }`}
                      />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          task.status === "Done"
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>

                      {/* Associated labels */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        {comp && (
                          <Link
                            href={`/competitions/${comp.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-500 hover:underline"
                          >
                            <Trophy className="h-3 w-3" />
                            <span className="truncate max-w-[140px]">{comp.name}</span>
                          </Link>
                        )}

                        {proj && (
                          <Link
                            href={`/projects/${proj.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:underline"
                          >
                            <FolderKanban className="h-3 w-3" />
                            <span className="truncate max-w-[140px]">{proj.name}</span>
                          </Link>
                        )}

                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span
                              className={
                                task.status === "Done"
                                  ? "text-muted-foreground"
                                  : rel.isOverdue
                                  ? "text-rose-500 font-semibold"
                                  : rel.isUrgent
                                  ? "text-amber-500 font-semibold"
                                  : "text-muted-foreground"
                              }
                            >
                              {formatDate(task.dueDate, "MMM d")} ({rel.text})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-muted-foreground hover:text-rose-500 transition"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
