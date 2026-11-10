"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Trophy,
  FolderKanban,
  CheckSquare,
  List,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  formatDate,
  formatDateTime,
  getRelativeDeadline,
} from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";

export default function CalendarPage() {
  const { competitions, projects, tasks } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "agenda">("month");
  const [filterType, setFilterType] = useState<"all" | "competition" | "project" | "task">("all");

  // Collect all dated events
  const allEvents = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      date: string;
      type: "competition" | "project" | "task";
      category: string;
      link: string;
      color: string;
    }> = [];

    // Competitions
    competitions.forEach((c) => {
      if (c.archived) return;
      if (c.dates?.registrationCloses) {
        list.push({
          id: `${c.id}-reg`,
          title: `${c.name} - Registration Closes`,
          date: c.dates.registrationCloses,
          type: "competition",
          category: "Registration",
          link: `/competitions/${c.id}`,
          color: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-400",
        });
      }
      if (c.dates?.eventStarts) {
        list.push({
          id: `${c.id}-start`,
          title: `${c.name} - Hackathon Begins`,
          date: c.dates.eventStarts,
          type: "competition",
          category: "Event Start",
          link: `/competitions/${c.id}`,
          color: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-400",
        });
      }
      if (c.dates?.submissionDeadline) {
        list.push({
          id: `${c.id}-sub`,
          title: `${c.name} - Final Submission`,
          date: c.dates.submissionDeadline,
          type: "competition",
          category: "Submission",
          link: `/competitions/${c.id}`,
          color: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-400 font-semibold",
        });
      }
      if (c.dates?.resultDate) {
        list.push({
          id: `${c.id}-res`,
          title: `${c.name} - Results Announced`,
          date: c.dates.resultDate,
          type: "competition",
          category: "Results",
          link: `/competitions/${c.id}`,
          color: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400",
        });
      }
    });

    // Projects Target Dates
    projects.forEach((p) => {
      if (p.targetDate) {
        list.push({
          id: `${p.id}-target`,
          title: `${p.name} - Target Launch`,
          date: p.targetDate,
          type: "project",
          category: "Milestone",
          link: `/projects/${p.id}`,
          color: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-400",
        });
      }
    });

    // Tasks Due Dates
    tasks.forEach((t) => {
      if (t.dueDate && t.status !== "Done") {
        list.push({
          id: `${t.id}-task`,
          title: `Task: ${t.title}`,
          date: t.dueDate,
          type: "task",
          category: `Priority: ${t.priority}`,
          link: "/tasks",
          color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-400",
        });
      }
    });

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [competitions, projects, tasks]);

  // Filtered by event type
  const filteredEvents = useMemo(() => {
    if (filterType === "all") return allEvents;
    return allEvents.filter((e) => e.type === filterType);
  }, [allEvents, filterType]);

  // Calendar month days grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Calendar & Deadlines
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Synchronized timeline of competition milestones, submission cutoffs, and project goals.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-card border border-border p-1">
            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "month"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "agenda"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* Month Navigation & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="rounded-lg border border-border p-2 hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-base font-bold text-foreground min-w-[160px] text-center">
            {formatDate(currentDate.toISOString(), "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="rounded-lg border border-border p-2 hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            Today
          </button>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "competition", label: "Competitions" },
            { id: "project", label: "Projects" },
            { id: "task", label: "Tasks" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id as any)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                filterType === type.id
                  ? "bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/30"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month View */}
      {viewMode === "month" ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-bold text-muted-foreground py-2.5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-border">
            {days.map((day) => {
              const dayStr = day.toISOString();
              const isCurrentMonth = isSameMonth(day, monthStart);
              const dayEvents = filteredEvents.filter((e) => {
                try {
                  return isSameDay(new Date(e.date), day);
                } catch {
                  return false;
                }
              });

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[105px] p-2 transition flex flex-col justify-between ${
                    !isCurrentMonth ? "bg-muted/15 opacity-40" : "bg-card"
                  } ${isToday(day) ? "bg-primary-500/5 ring-1 ring-inset ring-primary-500" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday(day)
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white"
                          : "text-foreground"
                      }`}
                    >
                      {formatDate(dayStr, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <Link
                        key={ev.id}
                        href={ev.link}
                        className={`block truncate rounded px-1.5 py-0.5 text-[10px] border ${ev.color} hover:opacity-80 transition`}
                      >
                        {ev.title}
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-semibold text-muted-foreground block text-right">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground">Upcoming Agenda</h2>
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No events match your current filter.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredEvents.map((ev) => {
                const rel = getRelativeDeadline(ev.date);

                return (
                  <div
                    key={ev.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={ev.link}
                          className="font-semibold text-xs text-foreground hover:text-primary-500"
                        >
                          {ev.title}
                        </Link>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] border ${ev.color}`}
                        >
                          {ev.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDateTime(ev.date)}</span>
                      </p>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        rel.isOverdue
                          ? "text-rose-500"
                          : rel.isUrgent
                          ? "text-amber-500"
                          : "text-foreground"
                      }`}
                    >
                      {rel.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
