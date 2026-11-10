"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Competition,
  Project,
  CompetitionProjectLink,
  Submission,
  Task,
  Teammate,
  Team,
  Result,
  AppFile,
  ActivityLog,
  UserProfile,
} from "@/types";
import {
  SEED_COMPETITIONS,
  SEED_PROJECTS,
  SEED_LINKS,
  SEED_SUBMISSIONS,
  SEED_TASKS,
  SEED_TEAMMATES,
  SEED_TEAMS,
  SEED_RESULTS,
  SEED_FILES,
  SEED_ACTIVITY,
} from "./seedData";

interface AppState {
  // Auth & Profile
  user: UserProfile | null;
  isFirebaseActive: boolean;
  theme: "light" | "dark" | "system";

  // Data Collections
  competitions: Competition[];
  projects: Project[];
  competitionProjectLinks: CompetitionProjectLink[];
  submissions: Submission[];
  tasks: Task[];
  teammates: Teammate[];
  teams: Team[];
  results: Result[];
  files: AppFile[];
  activityLogs: ActivityLog[];

  // User Actions
  setUser: (user: UserProfile | null) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Competition Actions
  addCompetition: (comp: Omit<Competition, "id" | "userId" | "createdAt" | "updatedAt">) => Competition;
  updateCompetition: (id: string, updates: Partial<Competition>) => void;
  deleteCompetition: (id: string) => void;
  archiveCompetition: (id: string, archived: boolean) => void;

  // Project Actions
  addProject: (proj: Omit<Project, "id" | "userId" | "createdAt" | "updatedAt">) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string, archived: boolean) => void;

  // Many-to-Many Linking Actions
  linkProjectToCompetition: (competitionId: string, projectId: string) => void;
  unlinkProjectFromCompetition: (competitionId: string, projectId: string) => void;

  // Submission Actions
  addSubmission: (sub: Omit<Submission, "id" | "userId" | "createdAt" | "updatedAt">) => Submission;
  updateSubmission: (id: string, updates: Partial<Submission>) => void;
  deleteSubmission: (id: string) => void;

  // Task Actions
  addTask: (task: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskDone: (id: string) => void;
  deleteTask: (id: string) => void;

  // Teammates & Teams Actions
  addTeammate: (tm: Omit<Teammate, "id" | "userId" | "createdAt">) => Teammate;
  updateTeammate: (id: string, updates: Partial<Teammate>) => void;
  deleteTeammate: (id: string) => void;

  addTeam: (team: Omit<Team, "id" | "userId" | "createdAt">) => Team;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  // Results Actions
  addResult: (res: Omit<Result, "id" | "userId" | "createdAt">) => Result;
  updateResult: (id: string, updates: Partial<Result>) => void;
  deleteResult: (id: string) => void;

  // Files Actions
  addFile: (file: Omit<AppFile, "id" | "userId" | "createdAt">) => AppFile;
  deleteFile: (id: string) => void;

  // System & Export
  logActivity: (log: Omit<ActivityLog, "id" | "userId" | "timestamp">) => void;
  exportJSON: () => string;
  importJSON: (jsonData: string) => boolean;
  exportCSV: (type: "competitions" | "projects" | "tasks") => string;
  resetToSampleData: () => void;
}

const DEFAULT_USER: UserProfile = {
  uid: "demo-user",
  email: "demo@obhijaan.app",
  displayName: "Competitor & Builder",
  preferredCurrency: "USD",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      isFirebaseActive: false,
      theme: "dark",

      competitions: SEED_COMPETITIONS,
      projects: SEED_PROJECTS,
      competitionProjectLinks: SEED_LINKS,
      submissions: SEED_SUBMISSIONS,
      tasks: SEED_TASKS,
      teammates: SEED_TEAMMATES,
      teams: SEED_TEAMS,
      results: SEED_RESULTS,
      files: SEED_FILES,
      activityLogs: SEED_ACTIVITY,

      setUser: (user) => set({ user }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          if (theme === "dark") {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      },

      logActivity: ({ entityType, entityId, action, description }) => {
        const userId = get().user?.uid || "demo-user";
        const newLog: ActivityLog = {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId,
          entityType,
          entityId,
          action,
          description,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          activityLogs: [newLog, ...state.activityLogs].slice(0, 100),
        }));
      },

      addCompetition: (compData) => {
        const userId = get().user?.uid || "demo-user";
        const id = `comp-${Date.now()}`;
        const now = new Date().toISOString();
        const newComp: Competition = {
          ...compData,
          id,
          userId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          competitions: [newComp, ...state.competitions],
        }));

        get().logActivity({
          entityType: "competition",
          entityId: id,
          action: "created",
          description: `Added competition: ${newComp.name}`,
        });

        return newComp;
      },

      updateCompetition: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          competitions: state.competitions.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: now } : c
          ),
        }));
        get().logActivity({
          entityType: "competition",
          entityId: id,
          action: "updated",
          description: `Updated competition details`,
        });
      },

      deleteCompetition: (id) => {
        const comp = get().competitions.find((c) => c.id === id);
        set((state) => ({
          competitions: state.competitions.filter((c) => c.id !== id),
          competitionProjectLinks: state.competitionProjectLinks.filter(
            (l) => l.competitionId !== id
          ),
          submissions: state.submissions.filter((s) => s.competitionId !== id),
          tasks: state.tasks.filter((t) => t.competitionId !== id),
          results: state.results.filter((r) => r.competitionId !== id),
        }));
        if (comp) {
          get().logActivity({
            entityType: "competition",
            entityId: id,
            action: "deleted",
            description: `Deleted competition: ${comp.name}`,
          });
        }
      },

      archiveCompetition: (id, archived) => {
        set((state) => ({
          competitions: state.competitions.map((c) =>
            c.id === id ? { ...c, archived, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      addProject: (projData) => {
        const userId = get().user?.uid || "demo-user";
        const id = `proj-${Date.now()}`;
        const now = new Date().toISOString();
        const newProj: Project = {
          ...projData,
          id,
          userId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          projects: [newProj, ...state.projects],
        }));

        get().logActivity({
          entityType: "project",
          entityId: id,
          action: "created",
          description: `Created project: ${newProj.name}`,
        });

        return newProj;
      },

      updateProject: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now } : p
          ),
        }));
        get().logActivity({
          entityType: "project",
          entityId: id,
          action: "updated",
          description: `Updated project`,
        });
      },

      deleteProject: (id) => {
        const proj = get().projects.find((p) => p.id === id);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          competitionProjectLinks: state.competitionProjectLinks.filter(
            (l) => l.projectId !== id
          ),
          submissions: state.submissions.map((s) =>
            s.projectId === id ? { ...s, projectId: undefined } : s
          ),
          tasks: state.tasks.map((t) =>
            t.projectId === id ? { ...t, projectId: undefined } : t
          ),
        }));
        if (proj) {
          get().logActivity({
            entityType: "project",
            entityId: id,
            action: "deleted",
            description: `Deleted project: ${proj.name}`,
          });
        }
      },

      archiveProject: (id, archived) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status: archived ? "Archived" : "In Progress", updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      linkProjectToCompetition: (competitionId, projectId) => {
        const exists = get().competitionProjectLinks.some(
          (l) => l.competitionId === competitionId && l.projectId === projectId
        );
        if (exists) return;

        const userId = get().user?.uid || "demo-user";
        const newLink: CompetitionProjectLink = {
          id: `cpl-${Date.now()}`,
          userId,
          competitionId,
          projectId,
          linkedAt: new Date().toISOString(),
        };

        set((state) => ({
          competitionProjectLinks: [...state.competitionProjectLinks, newLink],
        }));

        get().logActivity({
          entityType: "competition",
          entityId: competitionId,
          action: "project_linked",
          description: `Linked project to competition`,
        });
      },

      unlinkProjectFromCompetition: (competitionId, projectId) => {
        set((state) => ({
          competitionProjectLinks: state.competitionProjectLinks.filter(
            (l) => !(l.competitionId === competitionId && l.projectId === projectId)
          ),
        }));
      },

      addSubmission: (subData) => {
        const userId = get().user?.uid || "demo-user";
        const id = `sub-${Date.now()}`;
        const now = new Date().toISOString();
        const newSub: Submission = {
          ...subData,
          id,
          userId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          submissions: [newSub, ...state.submissions],
        }));

        get().logActivity({
          entityType: "submission",
          entityId: id,
          action: "created",
          description: `Created submission: ${newSub.title}`,
        });

        return newSub;
      },

      updateSubmission: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: now } : s
          ),
        }));
      },

      deleteSubmission: (id) => {
        set((state) => ({
          submissions: state.submissions.filter((s) => s.id !== id),
        }));
      },

      addTask: (taskData) => {
        const userId = get().user?.uid || "demo-user";
        const id = `task-${Date.now()}`;
        const now = new Date().toISOString();
        const newTask: Task = {
          ...taskData,
          id,
          userId,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));

        get().logActivity({
          entityType: "task",
          entityId: id,
          action: "created",
          description: `Added task: ${newTask.title}`,
        });

        return newTask;
      },

      updateTask: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: now } : t
          ),
        }));
      },

      toggleTaskDone: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              const newStatus = t.status === "Done" ? "To Do" : "Done";
              return { ...t, status: newStatus, updatedAt: now };
            }
            return t;
          }),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      addTeammate: (tmData) => {
        const userId = get().user?.uid || "demo-user";
        const id = `tm-${Date.now()}`;
        const newTm: Teammate = {
          ...tmData,
          id,
          userId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          teammates: [...state.teammates, newTm],
        }));
        return newTm;
      },

      updateTeammate: (id, updates) => {
        set((state) => ({
          teammates: state.teammates.map((tm) =>
            tm.id === id ? { ...tm, ...updates } : tm
          ),
        }));
      },

      deleteTeammate: (id) => {
        set((state) => ({
          teammates: state.teammates.filter((tm) => tm.id !== id),
          teams: state.teams.map((team) => ({
            ...team,
            memberIds: team.memberIds.filter((mid) => mid !== id),
            leadTeammateId: team.leadTeammateId === id ? undefined : team.leadTeammateId,
          })),
        }));
      },

      addTeam: (teamData) => {
        const userId = get().user?.uid || "demo-user";
        const id = `team-${Date.now()}`;
        const newTeam: Team = {
          ...teamData,
          id,
          userId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          teams: [...state.teams, newTeam],
        }));
        return newTeam;
      },

      updateTeam: (id, updates) => {
        set((state) => ({
          teams: state.teams.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      deleteTeam: (id) => {
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== id),
        }));
      },

      addResult: (resData) => {
        const userId = get().user?.uid || "demo-user";
        const id = `res-${Date.now()}`;
        const newRes: Result = {
          ...resData,
          id,
          userId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          results: [newRes, ...state.results],
        }));

        get().logActivity({
          entityType: "result",
          entityId: id,
          action: "recorded",
          description: `Recorded result: ${newRes.outcome} (${newRes.rank || newRes.awardCategory || ""})`,
        });

        return newRes;
      },

      updateResult: (id, updates) => {
        set((state) => ({
          results: state.results.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
      },

      deleteResult: (id) => {
        set((state) => ({
          results: state.results.filter((r) => r.id !== id),
        }));
      },

      addFile: (fileData) => {
        const userId = get().user?.uid || "demo-user";
        const id = `file-${Date.now()}`;
        const newFile: AppFile = {
          ...fileData,
          id,
          userId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          files: [newFile, ...state.files],
        }));
        return newFile;
      },

      deleteFile: (id) => {
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
        }));
      },

      exportJSON: () => {
        const state = get();
        const exportData = {
          version: "1.0",
          exportDate: new Date().toISOString(),
          user: state.user,
          competitions: state.competitions,
          projects: state.projects,
          competitionProjectLinks: state.competitionProjectLinks,
          submissions: state.submissions,
          tasks: state.tasks,
          teammates: state.teammates,
          teams: state.teams,
          results: state.results,
          files: state.files,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importJSON: (jsonData: string) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (!parsed.competitions || !parsed.projects) {
            return false;
          }
          set({
            competitions: parsed.competitions || [],
            projects: parsed.projects || [],
            competitionProjectLinks: parsed.competitionProjectLinks || [],
            submissions: parsed.submissions || [],
            tasks: parsed.tasks || [],
            teammates: parsed.teammates || [],
            teams: parsed.teams || [],
            results: parsed.results || [],
            files: parsed.files || [],
          });
          return true;
        } catch {
          return false;
        }
      },

      exportCSV: (type) => {
        const state = get();
        if (type === "competitions") {
          const headers = ["ID", "Name", "Organizer", "Status", "Format", "Location", "Registration Closes", "Submission Deadline", "Result Date", "Prize Pool"];
          const rows = state.competitions.map((c) => [
            c.id,
            `"${(c.name || "").replace(/"/g, '""')}"`,
            `"${(c.organizer || "").replace(/"/g, '""')}"`,
            c.status,
            c.format,
            `"${(c.location || "").replace(/"/g, '""')}"`,
            c.dates?.registrationCloses || "",
            c.dates?.submissionDeadline || "",
            c.dates?.resultDate || "",
            `"${(c.participation?.prizePool || "").replace(/"/g, '""')}"`,
          ]);
          return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        }

        if (type === "projects") {
          const headers = ["ID", "Name", "Status", "Category", "Tech Stack", "Repo URL", "Live URL", "Target Date"];
          const rows = state.projects.map((p) => [
            p.id,
            `"${(p.name || "").replace(/"/g, '""')}"`,
            p.status,
            `"${(p.category || "").replace(/"/g, '""')}"`,
            `"${(p.techStack || []).join("; ").replace(/"/g, '""')}"`,
            p.links?.repoUrl || "",
            p.links?.liveUrl || "",
            p.targetDate || "",
          ]);
          return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        }

        if (type === "tasks") {
          const headers = ["ID", "Title", "Status", "Priority", "Due Date", "Competition ID", "Project ID"];
          const rows = state.tasks.map((t) => [
            t.id,
            `"${(t.title || "").replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            t.dueDate || "",
            t.competitionId || "",
            t.projectId || "",
          ]);
          return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        }

        return "";
      },

      resetToSampleData: () => {
        set({
          competitions: SEED_COMPETITIONS,
          projects: SEED_PROJECTS,
          competitionProjectLinks: SEED_LINKS,
          submissions: SEED_SUBMISSIONS,
          tasks: SEED_TASKS,
          teammates: SEED_TEAMMATES,
          teams: SEED_TEAMS,
          results: SEED_RESULTS,
          files: SEED_FILES,
          activityLogs: SEED_ACTIVITY,
        });
      },
    }),
    {
      name: "obhijaan_storage_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
