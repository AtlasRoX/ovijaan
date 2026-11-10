"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Trophy,
  FolderKanban,
  CheckSquare,
  Calendar,
  Users,
  Award,
  FolderOpen,
  BarChart3,
  Settings,
  PlusCircle,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenQuickAdd?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile, onOpenQuickAdd }: SidebarProps) {
  const pathname = usePathname();
  const { competitions, tasks, projects, results } = useAppStore();

  const activeCompetitionsCount = competitions.filter(
    (c) => !c.archived && !["Completed", "Winner", "Finalist", "Not Selected", "Withdrawn"].includes(c.status)
  ).length;

  const pendingTasksCount = tasks.filter((t) => t.status !== "Done" && t.status !== "Cancelled").length;
  const activeProjectsCount = projects.filter((p) => p.status === "In Progress" || p.status === "Planned").length;
  const awardsCount = results.filter((r) => r.outcome === "Winner" || r.outcome === "Finalist").length;

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Competitions",
      href: "/competitions",
      icon: Trophy,
      badge: activeCompetitionsCount > 0 ? activeCompetitionsCount : null,
      badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Projects",
      href: "/projects",
      icon: FolderKanban,
      badge: activeProjectsCount > 0 ? activeProjectsCount : null,
      badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Calendar",
      href: "/calendar",
      icon: Calendar,
      badge: null,
    },
    {
      label: "Teams",
      href: "/teams",
      icon: Users,
      badge: null,
    },
    {
      label: "Achievements",
      href: "/achievements",
      icon: Award,
      badge: awardsCount > 0 ? awardsCount : null,
      badgeColor: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Files & Vault",
      href: "/files",
      icon: FolderOpen,
      badge: null,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-28 overflow-hidden rounded">
              <Image
                src="/logo.png"
                alt="OBHIJAAN"
                fill
                className="object-contain dark:invert"
                priority
              />
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <button
            onClick={() => {
              if (onOpenQuickAdd) onOpenQuickAdd();
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 active:scale-[0.98] transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Quick Create</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      item.badgeColor || "bg-muted text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-border p-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">OBHIJAAN v1.0</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Local Ready
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Private Competition Manager</p>
        </div>
      </aside>
    </>
  );
}
