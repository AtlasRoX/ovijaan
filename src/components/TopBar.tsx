"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, Trophy, FolderKanban, CheckSquare, Calendar,
  Users, Award, FolderOpen, BarChart3, Settings, Search,
  Bell, Sun, Moon, Plus, Menu, X, Clock, LogOut, LogIn, ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getRelativeDeadline, cn } from "@/lib/utils";
import { AuthModal } from "./AuthModal";

interface TopBarProps {
  onOpenQuickAdd: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard",    href: "/",            icon: LayoutDashboard },
  { label: "Competitions", href: "/competitions", icon: Trophy },
  { label: "Projects",     href: "/projects",     icon: FolderKanban },
  { label: "Tasks",        href: "/tasks",        icon: CheckSquare },
  { label: "Calendar",     href: "/calendar",     icon: Calendar },
  { label: "Teams",        href: "/teams",        icon: Users },
  { label: "Achievements", href: "/achievements", icon: Award },
  { label: "Files",        href: "/files",        icon: FolderOpen },
  { label: "Analytics",    href: "/analytics",    icon: BarChart3 },
  { label: "Settings",     href: "/settings",     icon: Settings },
] as const;

export function TopBar({ onOpenQuickAdd }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, competitions, tasks, projects, results, user, logout } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowBell(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Badge counts
  const badgeComp = competitions.filter(
    (c) => !c.archived && !["Completed","Winner","Finalist","Not Selected","Withdrawn"].includes(c.status)
  ).length;
  const badgeTask = tasks.filter((t) => t.status !== "Done" && t.status !== "Cancelled").length;
  const badgeProj = projects.filter((p) => p.status === "In Progress" || p.status === "Planned").length;
  const badgeAward = results.filter((r) => r.outcome === "Winner" || r.outcome === "Finalist").length;

  const badges: Record<string, number | null> = {
    "/competitions": badgeComp || null,
    "/projects":     badgeProj || null,
    "/tasks":        badgeTask || null,
    "/achievements": badgeAward || null,
  };

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Notifications
  const urgent = competitions
    .filter((c) => !c.archived && c.dates?.submissionDeadline)
    .map((c) => ({ id: c.id, title: c.name, date: c.dates.submissionDeadline!, rel: getRelativeDeadline(c.dates.submissionDeadline) }))
    .filter((x) => x.rel.isUrgent || x.rel.isOverdue)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) { router.push(`/competitions?q=${encodeURIComponent(searchQuery.trim())}`); setMobileOpen(false); }
  };

  const initials = (user?.displayName || user?.email || "G").charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-xs">
        {/* ── Top row ── */}
        <div className="max-w-7xl mx-auto flex h-[68px] items-center justify-between gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">

          {/* Left: Mobile burger + Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-9 w-32 transition hover:opacity-90">
                <Image src="/logo.png" alt="OBHIJAAN" fill className="object-contain dark:invert" priority />
              </div>
            </Link>
          </div>

          {/* Center: Search bar with generous width */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md mx-2 lg:mx-6">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search competitions, projects, milestones…"
                className="h-10 w-full rounded-xl border border-input/80 bg-muted/30 pl-10 pr-12 text-sm placeholder:text-muted-foreground/60 focus:bg-background focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition shadow-xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-muted/80 border border-border px-1.5 py-0.5 rounded-md select-none pointer-events-none">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Quick Add Button */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/25 transition active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground transition border border-border/50"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            {/* Bell */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => { setShowBell(!showBell); setShowUser(false); }}
                className="relative h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground transition border border-border/50"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {urgent.length > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                  </span>
                )}
              </button>
              {showBell && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card shadow-2xl animate-fade-in p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />Deadlines
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {urgent.length} urgent
                    </span>
                  </div>
                  {urgent.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No urgent deadlines 🎉</p>
                  ) : (
                    <div className="max-h-60 space-y-1.5 overflow-y-auto">
                      {urgent.map((d) => (
                        <button key={d.id} onClick={() => { setShowBell(false); router.push(`/competitions/${d.id}`); }}
                          className="w-full text-left rounded-xl p-2.5 hover:bg-muted transition">
                          <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                          <p className={cn("text-xs font-semibold mt-0.5", d.rel.isOverdue ? "text-rose-500" : "text-amber-500")}>
                            {d.rel.text}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            <div ref={userRef} className="relative">
              <button
                onClick={() => { setShowUser(!showUser); setShowBell(false); }}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted/80 transition border border-border/50"
                aria-label="Account"
              >
                {user?.photoURL && user.photoURL.startsWith("http") && !avatarError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt=""
                    onError={() => setAvatarError(true)}
                    className="h-8 w-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-indigo-600 text-xs font-bold text-white shadow-xs">
                    {initials}
                  </div>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block mr-1" />
              </button>
              {showUser && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-2xl animate-fade-in p-2 z-50">
                  <div className="px-3 py-2.5 mb-1 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.displayName || "Guest"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || "Local session"}</p>
                  </div>
                  <button onClick={() => { setShowUser(false); setShowAuthModal(true); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition">
                    <LogIn className="h-4 w-4 text-primary" />
                    {user?.uid === "guest-mode" ? "Sign In / Sync" : "Switch Account"}
                  </button>
                  <button onClick={async () => { setShowUser(false); await logout(); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Desktop Navigation Row (Centered & No Scrollbars) ── */}
        <div className="w-full border-t border-border/60 bg-muted/20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex items-center justify-center gap-1 sm:gap-1.5 xl:gap-2.5 py-2.5">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                const badge = badges[href];
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group relative flex items-center gap-1.5 xl:gap-2 px-2.5 lg:px-3 xl:px-3.5 py-1.5 xl:py-2 rounded-xl text-xs lg:text-[13px] xl:text-sm font-medium transition-all duration-150 whitespace-nowrap",
                      active
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-card hover:shadow-xs"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                        active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{label}</span>
                    {badge !== null && badge !== undefined && badge > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none transition-colors",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-primary/10 text-primary group-hover:bg-primary/20"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile menu panel ── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-14 z-20 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 right-0 top-14 z-30 max-h-[calc(100dvh-3.5rem)] overflow-y-auto bg-card border-b border-border shadow-2xl lg:hidden animate-fade-in">
            {/* Mobile search */}
            <div className="p-3 border-b border-border">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search…"
                    className="h-10 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-3 text-sm focus:outline-none focus:border-ring" />
                </div>
              </form>
            </div>
            {/* Mobile nav */}
            <nav className="p-2 space-y-0.5">
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = isActive(href);
                const badge = badges[href];
                return (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                    {badge !== null && badge !== undefined && badge > 0 && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">{badge}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-border">
              <button onClick={() => { setMobileOpen(false); onOpenQuickAdd(); }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition">
                <Plus className="h-4 w-4" /> Quick Add
              </button>
            </div>
          </div>
        </>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
