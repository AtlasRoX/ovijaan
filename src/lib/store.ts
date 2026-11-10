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
import { apiClient } from "./api-client";

interface AppState {
  // Auth & Profile
  user: UserProfile | null;
  authLoading: boolean;
  theme: "light" | "dark" | "system";

  // Real User Data Collections (No Synthetic/Seed Data)
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

  // User & Auth Actions
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  setAuthLoading: (loading: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  initTheme: () => void;
  syncFromFirestore: (userId: string) => Promise<void>;
  clearAllUserData: () => void;

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
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      authLoading: false,
      theme: "light",

      // Clean empty state with zero seeded / synthetic data
      competitions: [],
      projects: [],
      competitionProjectLinks: [],
      submissions: [],
      tasks: [],
      teammates: [],
      teams: [],
      results: [],
      files: [],
      activityLogs: [],

      setUser: (user) => {
        const prevUid = get().user?.uid;
        if (user && prevUid && user.uid !== prevUid) {
          get().clearAllUserData();
        }

        set({ user, authLoading: false });

        if (typeof window !== "undefined") {
          try {
            if (user) {
              localStorage.setItem("obhijaan_user_session", JSON.stringify(user));
            } else {
              localStorage.removeItem("obhijaan_user_session");
            }
          } catch (e) {}
        }

        if (user?.uid) {
          get().syncFromFirestore(user.uid);
        }
      },

      logout: async () => {
        set({ authLoading: true });
        try {
          await apiClient.auth.logout();
        } catch (e) {}
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("obhijaan_user_session");
          } catch (e) {}
        }
        set({ user: null, authLoading: false });
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },

      setAuthLoading: (loading) => set({ authLoading: loading }),

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

      initTheme: () => {
        const theme = get().theme;
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          if (theme === "dark") {
            root.classList.add("dark");
          } else {
            root.classList.remove("dark");
          }
        }
      },

      syncFromFirestore: async (userId: string) => {
        try {
          const data = await apiClient.sync.fetchUserData();
          if (!data) return;

          set((state) => ({
            competitions: data.competitions?.length > 0 ? data.competitions : state.competitions,
            projects: data.projects?.length > 0 ? data.projects : state.projects,
            competitionProjectLinks: data.competitionProjectLinks?.length > 0 ? data.competitionProjectLinks : state.competitionProjectLinks,
            submissions: data.submissions?.length > 0 ? data.submissions : state.submissions,
            tasks: data.tasks?.length > 0 ? data.tasks : state.tasks,
            teammates: data.teammates?.length > 0 ? data.teammates : state.teammates,
            teams: data.teams?.length > 0 ? data.teams : state.teams,
            results: data.results?.length > 0 ? data.results : state.results,
            files: data.files?.length > 0 ? data.files : state.files,
          }));
        } catch (err) {
          console.warn("Server sync error:", err);
        }
      },

      clearAllUserData: () => {
        set({
          competitions: [],
          projects: [],
          competitionProjectLinks: [],
          submissions: [],
          tasks: [],
          teammates: [],
          teams: [],
          results: [],
          files: [],
          activityLogs: [],
        });
      },

      logActivity: ({ entityType, entityId, action, description }) => {
        const userId = get().user?.uid || "anonymous";
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
        const userId = get().user?.uid || "anonymous";
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

        apiClient.sync.saveDoc("competitions", id, newComp);

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
        let updatedRecord: Competition | null = null;
        set((state) => ({
          competitions: state.competitions.map((c) => {
            if (c.id === id) {
              updatedRecord = { ...c, ...updates, updatedAt: now };
              return updatedRecord;
            }
            return c;
          }),
        }));
        if (updatedRecord) {
          apiClient.sync.saveDoc("competitions", id, updatedRecord);
        }
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
        apiClient.sync.deleteDoc("competitions", id);
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
        const now = new Date().toISOString();
        set((state) => ({
          competitions: state.competitions.map((c) => {
            if (c.id === id) {
              const updated = { ...c, archived, updatedAt: now };
              apiClient.sync.saveDoc("competitions", id, updated);
              return updated;
            }
            return c;
          }),
        }));
      },

      addProject: (projData) => {
        const userId = get().user?.uid || "anonymous";
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

        apiClient.sync.saveDoc("projects", id, newProj);

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
        let updatedRecord: Project | null = null;
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === id) {
              updatedRecord = { ...p, ...updates, updatedAt: now };
              return updatedRecord;
            }
            return p;
          }),
        }));
        if (updatedRecord) {
          apiClient.sync.saveDoc("projects", id, updatedRecord);
        }
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
        apiClient.sync.deleteDoc("projects", id);
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
        const now = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id === id) {
              const updated: Project = {
                ...p,
                status: archived ? "Archived" : "In Progress",
                updatedAt: now,
              };
              apiClient.sync.saveDoc("projects", id, updated);
              return updated;
            }
            return p;
          }),
        }));
      },

      linkProjectToCompetition: (competitionId, projectId) => {
        const exists = get().competitionProjectLinks.some(
          (l) => l.competitionId === competitionId && l.projectId === projectId
        );
        if (exists) return;

        const userId = get().user?.uid || "anonymous";
        const id = `cpl-${Date.now()}`;
        const newLink: CompetitionProjectLink = {
          id,
          userId,
          competitionId,
          projectId,
          linkedAt: new Date().toISOString(),
        };

        set((state) => ({
          competitionProjectLinks: [...state.competitionProjectLinks, newLink],
        }));

        apiClient.sync.saveDoc("competition_projects", id, newLink);

        get().logActivity({
          entityType: "competition",
          entityId: competitionId,
          action: "project_linked",
          description: `Linked project to competition`,
        });
      },

      unlinkProjectFromCompetition: (competitionId, projectId) => {
        const link = get().competitionProjectLinks.find(
          (l) => l.competitionId === competitionId && l.projectId === projectId
        );
        set((state) => ({
          competitionProjectLinks: state.competitionProjectLinks.filter(
            (l) => !(l.competitionId === competitionId && l.projectId === projectId)
          ),
        }));
        if (link) {
          apiClient.sync.deleteDoc("competition_projects", link.id);
        }
      },

      addSubmission: (subData) => {
        const userId = get().user?.uid || "anonymous";
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

        apiClient.sync.saveDoc("submissions", id, newSub);

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
        let updatedRecord: Submission | null = null;
        set((state) => ({
          submissions: state.submissions.map((s) => {
            if (s.id === id) {
              updatedRecord = { ...s, ...updates, updatedAt: now };
              return updatedRecord;
            }
            return s;
          }),
        }));
        if (updatedRecord) {
          apiClient.sync.saveDoc("submissions", id, updatedRecord);
        }
      },

      deleteSubmission: (id) => {
        set((state) => ({
          submissions: state.submissions.filter((s) => s.id !== id),
        }));
        apiClient.sync.deleteDoc("submissions", id);
      },

      addTask: (taskData) => {
        const userId = get().user?.uid || "anonymous";
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

        apiClient.sync.saveDoc("tasks", id, newTask);

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
        let updatedRecord: Task | null = null;
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              updatedRecord = { ...t, ...updates, updatedAt: now };
              return updatedRecord;
            }
            return t;
          }),
        }));
        if (updatedRecord) {
          apiClient.sync.saveDoc("tasks", id, updatedRecord);
        }
      },

      toggleTaskDone: (id) => {
        const now = new Date().toISOString();
        let updatedRecord: Task | null = null;
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              const newStatus = t.status === "Done" ? "To Do" : "Done";
              updatedRecord = { ...t, status: newStatus, updatedAt: now };
              return updatedRecord;
            }
            return t;
          }),
        }));
        if (updatedRecord) {
          apiClient.sync.saveDoc("tasks", id, updatedRecord);
        }
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        apiClient.sync.deleteDoc("tasks", id);
      },

      addTeammate: (tmData) => {
        const userId = get().user?.uid || "anonymous";
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
        apiClient.sync.saveDoc("teammates", id, newTm);
        return newTm;
      },

      updateTeammate: (id, updates) => {
        let updatedRecord: Teammate | null = null;
        set((state) => ({
          teammates: state.teammates.map((tm) => {
            if (tm.id === id) {
              updatedRecord = { ...tm, ...updates };
              return updatedRecord;
            }
            return tm;
          }),
        }));
        if (updatedRecord) {
          apiClient.sync.saveDoc("teammates", id, updatedRecord);
        }
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
        apiClient.sync.deleteDoc("teammates", id);
      },

      addTeam: (teamData) => {
        const userId = get().user?.uid || "anonymous";
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
        apiClient.sync.saveDoc("teams", id, newTeam);
        return newTeam;
      },

      updateTeam: (id, updates) => {
        let updatedRecord: Team | null = null;
        set((state) => ({
          teams: state.teams.map((t) => {
            if (t.id === id) {
              updatedRecord = { ...t, ...updates };
              return updatedRecord;
            }
            return t;
          }),
        }));
        if (updatedRecord) {
          apiClient.sync.saveDoc("teams", id, updatedRecord);
        }
      },

      deleteTeam: (id) => {
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== id),
        }));
        apiClient.sync.deleteDoc("teams", id);
      },

      addResult: (resData) => {
        const userId = get().user?.uid || "anonymous";
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

        apiClient.sync.saveDoc("results", id, newRes);

        get().logActivity({
          entityType: "result",
          entityId: id,
          action: "recorded",
          description: `Recorded result: ${newRes.outcome} (${newRes.rank || newRes.awardCategory || ""})`,
        });

        return newRes;
      },

      updateResult: (id, updates) => {
        let updatedRecord: Result | null = null;
        set((state) => ({
          results: state.results.map((r) => {
            if (r.id === id) {
              updatedRecord = { ...r, ...updates };
              return updatedRecord;
            }
            return r;
          }),
        }));
        if (updatedRecord) {
          apiClient.sync.saveDoc("results", id, updatedRecord);
        }
      },

      deleteResult: (id) => {
        set((state) => ({
          results: state.results.filter((r) => r.id !== id),
        }));
        apiClient.sync.deleteDoc("results", id);
      },

      addFile: (fileData) => {
        const userId = get().user?.uid || "anonymous";
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
        apiClient.sync.saveDoc("files", id, newFile);
        return newFile;
      },

      deleteFile: (id) => {
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
        }));
        apiClient.sync.deleteDoc("files", id);
      },

      exportJSON: () => {
        const state = get();
        const exportData = {
          version: "2.0",
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
    }),
    {
      name: "obhijaan_production_vault_v2",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } as any)
      ),
    }
  )
);
