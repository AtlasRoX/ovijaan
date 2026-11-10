"use client";

import { useState } from "react";
import { X, Trophy, FolderKanban, CheckSquare, Users } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { CompetitionStatus, ProjectStatus, TaskPriority } from "@/types";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "competition" | "project" | "task" | "teammate";
}

export function QuickAddModal({
  isOpen,
  onClose,
  defaultTab = "competition",
}: QuickAddModalProps) {
  const [activeTab, setActiveTab] = useState<"competition" | "project" | "task" | "teammate">(
    defaultTab
  );

  const {
    addCompetition,
    addProject,
    addTask,
    addTeammate,
    competitions,
    projects,
  } = useAppStore();

  // Competition Form State
  const [compName, setCompName] = useState("");
  const [compOrganizer, setCompOrganizer] = useState("");
  const [compCategory, setCompCategory] = useState("Hackathon");
  const [compStatus, setCompStatus] = useState<CompetitionStatus>("Interested");
  const [compFormat, setCompFormat] = useState<"online" | "offline" | "hybrid">("online");
  const [compDeadline, setCompDeadline] = useState("");
  const [compWebsite, setCompWebsite] = useState("");
  const [compTags, setCompTags] = useState("");

  // Project Form State
  const [projName, setProjName] = useState("");
  const [projTagline, setProjTagline] = useState("");
  const [projStatus, setProjStatus] = useState<ProjectStatus>("In Progress");
  const [projStack, setProjStack] = useState("");
  const [projRepo, setProjRepo] = useState("");

  // Task Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("Medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskCompId, setTaskCompId] = useState("");
  const [taskProjId, setTaskProjId] = useState("");

  // Teammate Form State
  const [tmName, setTmName] = useState("");
  const [tmRole, setTmRole] = useState("");
  const [tmEmail, setTmEmail] = useState("");
  const [tmSkills, setTmSkills] = useState("");

  if (!isOpen) return null;

  const handleCreateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    addCompetition({
      name: compName.trim(),
      organizer: compOrganizer.trim() || undefined,
      category: compCategory,
      status: compStatus,
      format: compFormat,
      websiteUrl: compWebsite.trim() || undefined,
      tags: compTags ? compTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      dates: {
        submissionDeadline: compDeadline ? new Date(compDeadline).toISOString() : undefined,
      },
      participation: {},
    });

    onClose();
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    addProject({
      name: projName.trim(),
      tagline: projTagline.trim() || undefined,
      status: projStatus,
      tags: [],
      techStack: projStack ? projStack.split(",").map((s) => s.trim()).filter(Boolean) : [],
      links: {
        repoUrl: projRepo.trim() || undefined,
      },
    });

    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      status: "To Do",
      priority: taskPriority,
      dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      competitionId: taskCompId || undefined,
      projectId: taskProjId || undefined,
      tags: [],
    });

    onClose();
  };

  const handleCreateTeammate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmName.trim()) return;

    addTeammate({
      name: tmName.trim(),
      role: tmRole.trim() || undefined,
      email: tmEmail.trim() || undefined,
      skills: tmSkills ? tmSkills.split(",").map((s) => s.trim()).filter(Boolean) : [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-bold text-foreground">Quick Create</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab("competition")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === "competition"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Comp</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("project")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === "project"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>Project</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("task")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === "task"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Task</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("teammate")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === "teammate"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Teammate</span>
          </button>
        </div>

        {/* Tab 1: Competition */}
        {activeTab === "competition" && (
          <form onSubmit={handleCreateCompetition} className="mt-4 space-y-3.5">
            <div>
              <label className="text-xs font-medium text-foreground">Competition Name *</label>
              <input
                type="text"
                required
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="e.g. Google Gemini AI Challenge 2026"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-foreground">Organizer</label>
                <input
                  type="text"
                  value={compOrganizer}
                  onChange={(e) => setCompOrganizer(e.target.value)}
                  placeholder="e.g. Google / Devpost"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Category</label>
                <select
                  value={compCategory}
                  onChange={(e) => setCompCategory(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="AI & Innovation">AI & Innovation</option>
                  <option value="Coding Contest">Coding Contest</option>
                  <option value="CTF & Security">CTF & Security</option>
                  <option value="Research Challenge">Research Challenge</option>
                  <option value="Startup Pitch">Startup Pitch</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-foreground">Status</label>
                <select
                  value={compStatus}
                  onChange={(e) => setCompStatus(e.target.value as CompetitionStatus)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="Interested">Interested</option>
                  <option value="Planning to Apply">Planning to Apply</option>
                  <option value="Application in Progress">Application in Progress</option>
                  <option value="Applied">Applied</option>
                  <option value="Participating">Participating</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Format</label>
                <select
                  value={compFormat}
                  onChange={(e) => setCompFormat(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline / In-person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Submission Deadline</label>
              <input
                type="datetime-local"
                value={compDeadline}
                onChange={(e) => setCompDeadline(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
            >
              Create Competition
            </button>
          </form>
        )}

        {/* Tab 2: Project */}
        {activeTab === "project" && (
          <form onSubmit={handleCreateProject} className="mt-4 space-y-3.5">
            <div>
              <label className="text-xs font-medium text-foreground">Project Name *</label>
              <input
                type="text"
                required
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                placeholder="e.g. Obhijaan Dashboard"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Tagline</label>
              <input
                type="text"
                value={projTagline}
                onChange={(e) => setProjTagline(e.target.value)}
                placeholder="Short one-line pitch"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-foreground">Status</label>
                <select
                  value={projStatus}
                  onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="Idea">Idea</option>
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={projStack}
                  onChange={(e) => setProjStack(e.target.value)}
                  placeholder="Next.js, Python, Tailwind"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Repository URL</label>
              <input
                type="url"
                value={projRepo}
                onChange={(e) => setProjRepo(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
            >
              Create Project
            </button>
          </form>
        )}

        {/* Tab 3: Task */}
        {activeTab === "task" && (
          <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5">
            <div>
              <label className="text-xs font-medium text-foreground">Task Title *</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Record 2-min pitch video"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-foreground">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-foreground">Link to Competition</label>
                <select
                  value={taskCompId}
                  onChange={(e) => setTaskCompId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="">None (Independent)</option>
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Link to Project</label>
                <select
                  value={taskProjId}
                  onChange={(e) => setTaskProjId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
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

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
            >
              Add Task
            </button>
          </form>
        )}

        {/* Tab 4: Teammate */}
        {activeTab === "teammate" && (
          <form onSubmit={handleCreateTeammate} className="mt-4 space-y-3.5">
            <div>
              <label className="text-xs font-medium text-foreground">Teammate Name *</label>
              <input
                type="text"
                required
                value={tmName}
                onChange={(e) => setTmName(e.target.value)}
                placeholder="e.g. Ayesha Rahman"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-foreground">Role / Expertise</label>
                <input
                  type="text"
                  value={tmRole}
                  onChange={(e) => setTmRole(e.target.value)}
                  placeholder="UI/UX Designer, ML Dev"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={tmEmail}
                  onChange={(e) => setTmEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Skills (comma separated)</label>
              <input
                type="text"
                value={tmSkills}
                onChange={(e) => setTmSkills(e.target.value)}
                placeholder="Figma, React, PyTorch"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
            >
              Add Teammate
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
