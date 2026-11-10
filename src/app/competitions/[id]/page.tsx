"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Tag,
  ArrowLeft,
  FolderKanban,
  CheckSquare,
  Award,
  FileText,
  Trash2,
  Edit3,
  Plus,
  CheckCircle2,
  Sparkles,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  formatDate,
  formatDateTime,
  getRelativeDeadline,
  formatCurrency,
  getStatusBadgeClass,
} from "@/lib/utils";
import { CompetitionStatus, SubmissionStatus, ResultOutcome } from "@/types";

export default function CompetitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    competitions,
    updateCompetition,
    deleteCompetition,
    projects,
    competitionProjectLinks,
    linkProjectToCompetition,
    unlinkProjectFromCompetition,
    submissions,
    addSubmission,
    updateSubmission,
    tasks,
    addTask,
    toggleTaskDone,
    results,
    addResult,
  } = useAppStore();

  const comp = competitions.find((c) => c.id === resolvedParams.id);
  const [activeTab, setActiveTab] = useState<
    "overview" | "dates" | "projects" | "submission" | "tasks" | "results"
  >("overview");

  // Project linking state
  const [selectedProjectIdToLink, setSelectedProjectIdToLink] = useState("");

  // Quick Task in competition
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Submission Form State
  const compSubmissions = submissions.filter((s) => s.competitionId === resolvedParams.id);
  const currentSub = compSubmissions[0];
  const [subTitle, setSubTitle] = useState(currentSub?.title || "");
  const [subDesc, setSubDesc] = useState(currentSub?.description || "");
  const [subRepo, setSubRepo] = useState(currentSub?.repoUrl || "");
  const [subLive, setSubLive] = useState(currentSub?.liveUrl || "");
  const [subVideo, setSubVideo] = useState(currentSub?.demoVideoUrl || "");
  const [subStatus, setSubStatus] = useState<SubmissionStatus>(currentSub?.status || "Draft");

  // Result Form State
  const compResult = results.find((r) => r.competitionId === resolvedParams.id);
  const [resOutcome, setResOutcome] = useState<ResultOutcome>(compResult?.outcome || "Participated");
  const [resRank, setResRank] = useState(compResult?.rank || "");
  const [resAward, setResAward] = useState(compResult?.awardCategory || "");
  const [resPrize, setResPrize] = useState(compResult?.prizeAmount?.toString() || "");
  const [resCurrency, setResCurrency] = useState(compResult?.prizeCurrency || "USD");
  const [resFeedback, setResFeedback] = useState(compResult?.feedback || "");

  // Edit Competition Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(comp?.name || "");
  const [editOrganizer, setEditOrganizer] = useState(comp?.organizer || "");
  const [editCategory, setEditCategory] = useState(comp?.category || "Hackathon");
  const [editFormat, setEditFormat] = useState<"online" | "offline" | "hybrid">(comp?.format || "online");
  const [editLocation, setEditLocation] = useState(comp?.location || "");
  const [editDescription, setEditDescription] = useState(comp?.shortDescription || "");
  const [editWebsite, setEditWebsite] = useState(comp?.websiteUrl || "");
  const [editPrize, setEditPrize] = useState(comp?.participation?.prizePool || "");
  const [editEligibility, setEditEligibility] = useState(comp?.participation?.eligibility || "");
  const [editRules, setEditRules] = useState(comp?.participation?.rules || "");
  const [editTags, setEditTags] = useState(comp?.tags?.join(", ") || "");
  const [editNotes, setEditNotes] = useState(comp?.personalNotes || "");
  const [editRegCloses, setEditRegCloses] = useState(comp?.dates?.registrationCloses ? comp.dates.registrationCloses.slice(0, 16) : "");
  const [editSubDeadline, setEditSubDeadline] = useState(comp?.dates?.submissionDeadline ? comp.dates.submissionDeadline.slice(0, 16) : "");

  if (!comp) {
    return (
      <div className="py-16 text-center">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-lg font-bold">Competition not found</h2>
        <Link
          href="/competitions"
          className="mt-3 inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to competitions
        </Link>
      </div>
    );
  }

  // Linked projects
  const linkedProjectIds = competitionProjectLinks
    .filter((l) => l.competitionId === comp.id)
    .map((l) => l.projectId);
  const linkedProjects = projects.filter((p) => linkedProjectIds.includes(p.id));
  const availableProjectsToLink = projects.filter((p) => !linkedProjectIds.includes(p.id));

  // Related tasks
  const compTasks = tasks.filter((t) => t.competitionId === comp.id);

  const nearestDeadline = comp.dates?.submissionDeadline || comp.dates?.registrationCloses;
  const relDeadline = getRelativeDeadline(nearestDeadline);

  const handleStatusChange = async (newStatus: CompetitionStatus) => {
    updateCompetition(comp.id, { status: newStatus });
    if (newStatus === "Winner") {
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${comp.name}"?`)) {
      deleteCompetition(comp.id);
      router.push("/competitions");
    }
  };

  const handleSaveSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim()) return;

    if (currentSub) {
      updateSubmission(currentSub.id, {
        title: subTitle.trim(),
        description: subDesc.trim(),
        repoUrl: subRepo.trim() || undefined,
        liveUrl: subLive.trim() || undefined,
        demoVideoUrl: subVideo.trim() || undefined,
        status: subStatus,
        submittedAt: subStatus === "Submitted" ? new Date().toISOString() : currentSub.submittedAt,
      });
    } else {
      addSubmission({
        competitionId: comp.id,
        projectId: linkedProjects[0]?.id,
        title: subTitle.trim(),
        description: subDesc.trim(),
        repoUrl: subRepo.trim() || undefined,
        liveUrl: subLive.trim() || undefined,
        demoVideoUrl: subVideo.trim() || undefined,
        status: subStatus,
        submittedAt: subStatus === "Submitted" ? new Date().toISOString() : undefined,
      });
    }
    alert("Submission record saved!");
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    addResult({
      competitionId: comp.id,
      outcome: resOutcome,
      rank: resRank.trim() || undefined,
      awardCategory: resAward.trim() || undefined,
      prizeAmount: resPrize ? parseFloat(resPrize) : undefined,
      prizeCurrency: resCurrency,
      feedback: resFeedback.trim() || undefined,
    });
    if (resOutcome === "Winner") {
      updateCompetition(comp.id, { status: "Winner" });
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      } catch {}
    }
    alert("Result & outcome saved!");
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      status: "To Do",
      priority: "Medium",
      competitionId: comp.id,
      tags: [],
    });
    setNewTaskTitle("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateCompetition(comp.id, {
      name: editName.trim(),
      organizer: editOrganizer.trim() || undefined,
      category: editCategory,
      format: editFormat,
      location: editLocation.trim() || undefined,
      shortDescription: editDescription.trim() || undefined,
      websiteUrl: editWebsite.trim() || undefined,
      tags: editTags ? editTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      personalNotes: editNotes.trim() || undefined,
      dates: {
        ...comp.dates,
        registrationCloses: editRegCloses ? new Date(editRegCloses).toISOString() : comp.dates?.registrationCloses,
        submissionDeadline: editSubDeadline ? new Date(editSubDeadline).toISOString() : comp.dates?.submissionDeadline,
      },
      participation: {
        ...comp.participation,
        prizePool: editPrize.trim() || undefined,
        eligibility: editEligibility.trim() || undefined,
        rules: editRules.trim() || undefined,
      },
    });

    setShowEditModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/competitions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Competitions</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
          >
            <Edit3 className="h-3.5 w-3.5 text-primary-500" />
            <span>Edit</span>
          </button>
          {comp.websiteUrl && (
            <a
              href={comp.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              <span>Official Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
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

      {/* Main Detail Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-semibold border ${getStatusBadgeClass(
                  comp.status
                )}`}
              >
                {comp.status}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                {comp.format}
              </span>
              {comp.category && (
                <span className="rounded-md bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">
                  {comp.category}
                </span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {comp.name}
            </h1>

            {comp.organizer && (
              <p className="mt-1 text-sm text-muted-foreground">
                Organized by <span className="font-semibold text-foreground">{comp.organizer}</span>
                {comp.location && ` • ${comp.location}`}
              </p>
            )}

            {comp.shortDescription && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {comp.shortDescription}
              </p>
            )}
          </div>

          {/* Quick Status Updater */}
          <div className="shrink-0 rounded-2xl border border-border bg-background/50 p-4 min-w-[200px]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Lifecycle Status
            </label>
            <select
              value={comp.status}
              onChange={(e) => handleStatusChange(e.target.value as CompetitionStatus)}
              className="mt-1.5 h-9 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground focus:border-primary-500 focus:outline-none"
            >
              <option value="Interested">Interested</option>
              <option value="Planning to Apply">Planning to Apply</option>
              <option value="Application in Progress">Application in Progress</option>
              <option value="Applied">Applied</option>
              <option value="Registration Confirmed">Registration Confirmed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Participating">Participating</option>
              <option value="Submission Completed">Submission Completed</option>
              <option value="Finalist">Finalist</option>
              <option value="Winner">Winner 🏆</option>
              <option value="Not Selected">Not Selected</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="Completed">Completed</option>
            </select>

            {nearestDeadline && (
              <div className="mt-3 pt-3 border-t border-border text-xs">
                <span className="text-[11px] text-muted-foreground">Next Milestone:</span>
                <p
                  className={`font-bold mt-0.5 ${
                    relDeadline.isOverdue
                      ? "text-rose-500"
                      : relDeadline.isUrgent
                      ? "text-amber-500"
                      : "text-foreground"
                  }`}
                >
                  {relDeadline.text}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(nearestDeadline, "MMM d, yyyy")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          {[
            { id: "overview", label: "Overview", icon: Trophy },
            { id: "dates", label: "Dates & Schedule", icon: Calendar },
            { id: "projects", label: `Linked Projects (${linkedProjects.length})`, icon: FolderKanban },
            { id: "submission", label: "Submission Vault", icon: FileText },
            { id: "tasks", label: `Tasks (${compTasks.length})`, icon: CheckSquare },
            { id: "results", label: "Results & Awards", icon: Award },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Participation Details</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground">Prize Pool:</span>
                <p className="font-semibold text-foreground text-sm mt-0.5">
                  {comp.participation?.prizePool || "Not specified"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Eligibility:</span>
                <p className="text-foreground mt-0.5 leading-relaxed">
                  {comp.participation?.eligibility || "Open / standard eligibility"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Team Size Limit:</span>
                <p className="text-foreground mt-0.5">
                  {comp.participation?.teamSizeMin || 1} to{" "}
                  {comp.participation?.teamSizeMax || "unlimited"} members
                </p>
              </div>
              {comp.participation?.registrationId && (
                <div>
                  <span className="text-muted-foreground">Registration ID / Code:</span>
                  <p className="font-mono font-semibold text-primary-500 mt-0.5">
                    {comp.participation.registrationId}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Notes & Tags</h3>
            <div>
              <span className="text-xs text-muted-foreground">Tags:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {comp.tags?.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Personal Notes:</span>
              <p className="mt-1 text-xs text-foreground leading-relaxed whitespace-pre-line bg-background/50 p-3 rounded-xl border border-border">
                {comp.personalNotes || "No notes added yet."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dates & Milestones */}
      {activeTab === "dates" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Important Timelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Registration Opens", date: comp.dates?.registrationOpens },
              { label: "Registration Closes", date: comp.dates?.registrationCloses },
              { label: "Event Starts", date: comp.dates?.eventStarts },
              { label: "Event Ends", date: comp.dates?.eventEnds },
              { label: "Idea / Proposal Deadline", date: comp.dates?.ideaDeadline },
              { label: "Final Submission Deadline", date: comp.dates?.submissionDeadline },
              { label: "Presentation / Judging Date", date: comp.dates?.presentationDate },
              { label: "Results Announcement", date: comp.dates?.resultDate },
            ].map((d) => (
              <div
                key={d.label}
                className="rounded-xl border border-border/80 bg-background/50 p-3.5"
              >
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {d.label}
                </span>
                <p className="text-sm font-bold text-foreground mt-1">
                  {d.date ? formatDateTime(d.date) : "Not set"}
                </p>
                {d.date && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {getRelativeDeadline(d.date).text}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Custom Milestones */}
          {comp.dates?.customMilestones && comp.dates.customMilestones.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-xs font-bold text-foreground mb-3">Custom Milestones</h4>
              <div className="space-y-2">
                {comp.dates.customMilestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <span className="text-xs font-medium text-foreground">{m.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(m.date, "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Linked Projects */}
      {activeTab === "projects" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Linked Projects</h3>
              <p className="text-xs text-muted-foreground">
                Projects connected to this competition (without duplicate copies).
              </p>
            </div>

            {availableProjectsToLink.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedProjectIdToLink}
                  onChange={(e) => setSelectedProjectIdToLink(e.target.value)}
                  className="h-9 rounded-xl border border-input bg-background px-3 text-xs"
                >
                  <option value="">Select a project to link...</option>
                  {availableProjectsToLink.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (selectedProjectIdToLink) {
                      linkProjectToCompetition(comp.id, selectedProjectIdToLink);
                      setSelectedProjectIdToLink("");
                    }
                  }}
                  disabled={!selectedProjectIdToLink}
                  className="h-9 rounded-xl bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  Link
                </button>
              </div>
            )}
          </div>

          {linkedProjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No projects linked to this competition yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {linkedProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-xl border border-border p-4 bg-background/50"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-bold text-sm text-foreground hover:text-primary-600"
                      >
                        {p.name}
                      </Link>
                      <button
                        onClick={() => unlinkProjectFromCompetition(comp.id, p.id)}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Unlink
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {p.tagline || p.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{p.status}</span>
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-semibold text-primary-500"
                    >
                      Open Project →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Submissions */}
      {activeTab === "submission" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Competition Submission Vault</h3>
            <p className="text-xs text-muted-foreground">
              Maintain competition-specific submission materials independently from project links.
            </p>
          </div>

          <form onSubmit={handleSaveSubmission} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground">Submission Title *</label>
              <input
                type="text"
                required
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                placeholder="e.g. Obhijaan - Personalized Hackathon Manager"
                className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Submission Description</label>
              <textarea
                rows={3}
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
                placeholder="Pitch summary entered into Devpost or contest portal..."
                className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground">Repository URL</label>
                <input
                  type="url"
                  value={subRepo}
                  onChange={(e) => setSubRepo(e.target.value)}
                  placeholder="https://github.com/..."
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Live Demo URL</label>
                <input
                  type="url"
                  value={subLive}
                  onChange={(e) => setSubLive(e.target.value)}
                  placeholder="https://my-app.vercel.app"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Demo Video URL</label>
                <input
                  type="url"
                  value={subVideo}
                  onChange={(e) => setSubVideo(e.target.value)}
                  placeholder="YouTube or Loom video link"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-foreground">Submission Status:</label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value as SubmissionStatus)}
                  className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium"
                >
                  <option value="Draft">Draft</option>
                  <option value="Ready">Ready</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Updated">Updated</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
              >
                Save Submission
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 5: Tasks */}
      {activeTab === "tasks" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Competition Tasks</h3>
          </div>

          <form onSubmit={handleQuickAddTask} className="flex gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a task for this competition (e.g. record demo video)..."
              className="h-9 flex-1 rounded-xl border border-input bg-background px-3 text-xs focus:border-primary-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700"
            >
              Add Task
            </button>
          </form>

          {compTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              No tasks specifically tied to this competition yet.
            </div>
          ) : (
            <div className="space-y-2">
              {compTasks.map((t) => (
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
      )}

      {/* Tab 6: Results & Awards */}
      {activeTab === "results" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recorded Results & Achievements</h3>
            <p className="text-xs text-muted-foreground">
              Record outcome, rank, awards, judge feedback, and certificates.
            </p>
          </div>

          <form onSubmit={handleSaveResult} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground">Outcome</label>
                <select
                  value={resOutcome}
                  onChange={(e) => setResOutcome(e.target.value as ResultOutcome)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="Winner">Winner 🏆</option>
                  <option value="Finalist">Finalist 🌟</option>
                  <option value="Special Award">Special Award</option>
                  <option value="Participated">Participated</option>
                  <option value="Not Selected">Not Selected</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Rank / Position</label>
                <input
                  type="text"
                  value={resRank}
                  onChange={(e) => setResRank(e.target.value)}
                  placeholder="e.g. 1st Place, Top 5 Finalist"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground">Award Category</label>
                <input
                  type="text"
                  value={resAward}
                  onChange={(e) => setResAward(e.target.value)}
                  placeholder="e.g. Best AI Solution"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Prize Amount</label>
                <input
                  type="number"
                  value={resPrize}
                  onChange={(e) => setResPrize(e.target.value)}
                  placeholder="e.g. 50000"
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Currency</label>
                <select
                  value={resCurrency}
                  onChange={(e) => setResCurrency(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="BDT">BDT (৳)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground">Judge Feedback / Reflections</label>
              <textarea
                rows={3}
                value={resFeedback}
                onChange={(e) => setResFeedback(e.target.value)}
                placeholder="Feedback from judges or lessons learned for future contests..."
                className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 transition"
            >
              Save Result
            </button>
          </form>
        </div>
      )}

      {/* Edit Competition Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground">Edit Competition Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground">Competition Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground">Organizer</label>
                  <input
                    type="text"
                    value={editOrganizer}
                    onChange={(e) => setEditOrganizer(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground">Event Format</label>
                  <select
                    value={editFormat}
                    onChange={(e) => setEditFormat(e.target.value as any)}
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline / In-person</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Location / Venue</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA or Online"
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Official Website URL</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Short Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground">Registration Closes</label>
                  <input
                    type="datetime-local"
                    value={editRegCloses}
                    onChange={(e) => setEditRegCloses(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Final Submission Deadline</label>
                  <input
                    type="datetime-local"
                    value={editSubDeadline}
                    onChange={(e) => setEditSubDeadline(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground">Prize Pool</label>
                  <input
                    type="text"
                    value={editPrize}
                    onChange={(e) => setEditPrize(e.target.value)}
                    placeholder="e.g. $50,000 in cash & prizes"
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="AI, FullStack, OpenSource"
                    className="mt-1 h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Personal Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Key observations, team reminders..."
                  className="mt-1 w-full rounded-xl border border-input bg-background p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
