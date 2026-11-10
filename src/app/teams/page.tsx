"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Mail,
  Github,
  Linkedin,
  Globe,
  Trash2,
  UserCheck,
  Shield,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function TeamsPage() {
  const {
    teammates,
    teams,
    addTeammate,
    deleteTeammate,
    addTeam,
    deleteTeam,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"teammates" | "teams">("teammates");

  // New teammate form
  const [tmName, setTmName] = useState("");
  const [tmRole, setTmRole] = useState("");
  const [tmEmail, setTmEmail] = useState("");
  const [tmSkills, setTmSkills] = useState("");
  const [tmGithub, setTmGithub] = useState("");
  const [tmLinkedin, setTmLinkedin] = useState("");
  const [showAddTm, setShowAddTm] = useState(false);

  // New team form
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [showAddTeam, setShowAddTeam] = useState(false);

  const handleAddTeammate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmName.trim()) return;

    addTeammate({
      name: tmName.trim(),
      role: tmRole.trim() || undefined,
      email: tmEmail.trim() || undefined,
      githubUrl: tmGithub.trim() || undefined,
      linkedinUrl: tmLinkedin.trim() || undefined,
      skills: tmSkills ? tmSkills.split(",").map((s) => s.trim()).filter(Boolean) : [],
    });

    setTmName("");
    setTmRole("");
    setTmEmail("");
    setTmSkills("");
    setTmGithub("");
    setTmLinkedin("");
    setShowAddTm(false);
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    addTeam({
      name: teamName.trim(),
      description: teamDesc.trim() || undefined,
      memberIds: teammates.map((t) => t.id),
    });

    setTeamName("");
    setTeamDesc("");
    setShowAddTeam(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Teams & Collaborators
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Maintain reusable teammate profiles and squad rosters for hackathon team formation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "teammates" ? (
            <button
              onClick={() => setShowAddTm(!showAddTm)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Teammate</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddTeam(!showAddTeam)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Team Squad</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("teammates")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "teammates"
              ? "bg-primary-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Teammate Profiles ({teammates.length})
        </button>
        <button
          onClick={() => setActiveTab("teams")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "teams"
              ? "bg-primary-600 text-white"
              : "bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          Squad Formations ({teams.length})
        </button>
      </div>

      {/* Add Teammate Form Drawer */}
      {showAddTm && activeTab === "teammates" && (
        <form
          onSubmit={handleAddTeammate}
          className="rounded-2xl border border-primary-500/30 bg-card p-5 space-y-3 animate-fade-in"
        >
          <h3 className="text-sm font-bold text-foreground">Add New Collaborator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Name *</label>
              <input
                type="text"
                required
                value={tmName}
                onChange={(e) => setTmName(e.target.value)}
                placeholder="Full Name"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">Role / Domain</label>
              <input
                type="text"
                value={tmRole}
                onChange={(e) => setTmRole(e.target.value)}
                placeholder="e.g. Frontend Dev, ML Researcher"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground">Email</label>
              <input
                type="email"
                value={tmEmail}
                onChange={(e) => setTmEmail(e.target.value)}
                placeholder="email@example.com"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">GitHub Profile URL</label>
              <input
                type="url"
                value={tmGithub}
                onChange={(e) => setTmGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground">LinkedIn URL</label>
              <input
                type="url"
                value={tmLinkedin}
                onChange={(e) => setTmLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
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
              placeholder="Next.js, Python, UI/UX, Cloud"
              className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddTm(false)}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Add Team Drawer */}
      {showAddTeam && activeTab === "teams" && (
        <form
          onSubmit={handleAddTeam}
          className="rounded-2xl border border-primary-500/30 bg-card p-5 space-y-3 animate-fade-in"
        >
          <h3 className="text-sm font-bold text-foreground">Create Squad Roster</h3>
          <div>
            <label className="text-xs font-medium text-foreground">Team Name *</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Apex Innovators"
              className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground">Description / Focus</label>
            <input
              type="text"
              value={teamDesc}
              onChange={(e) => setTeamDesc(e.target.value)}
              placeholder="Core hackathon squad for AI challenges"
              className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddTeam(false)}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
            >
              Save Team
            </button>
          </div>
        </form>
      )}

      {/* Tab 1: Teammates Grid */}
      {activeTab === "teammates" && (
        teammates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-bold text-foreground">No collaborators added</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Save profiles of your frequent hackathon teammates, developers, and designers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teammates.map((tm) => (
              <div
                key={tm.id}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between hover:border-primary-500/30 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 font-bold text-sm text-primary-600 dark:text-primary-400">
                        {tm.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{tm.name}</h3>
                        {tm.role && (
                          <p className="text-xs text-muted-foreground">{tm.role}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTeammate(tm.id)}
                      className="p-1 text-muted-foreground hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Skills */}
                  {tm.skills && tm.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {tm.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Social / Contact Links */}
                <div className="mt-5 pt-3 border-t border-border flex items-center gap-3 text-xs text-muted-foreground">
                  {tm.email && (
                    <a
                      href={`mailto:${tm.email}`}
                      className="hover:text-foreground"
                      title={tm.email}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                  {tm.githubUrl && (
                    <a
                      href={tm.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {tm.linkedinUrl && (
                    <a
                      href={tm.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 2: Teams Grid */}
      {activeTab === "teams" && (
        teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-bold text-foreground">No squads created</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Assemble named teams from your collaborator contacts to assign to competitions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-border bg-card p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{team.name}</h3>
                    {team.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {team.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="p-1 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Members:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.memberIds.map((mid) => {
                      const member = teammates.find((tm) => tm.id === mid);
                      if (!member) return null;
                      return (
                        <span
                          key={member.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium"
                        >
                          <UserCheck className="h-3 w-3 text-primary-500" />
                          <span>{member.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
