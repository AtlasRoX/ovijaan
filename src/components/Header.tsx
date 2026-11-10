"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Command,
  LogOut,
  User,
  LogIn,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getRelativeDeadline } from "@/lib/utils";
import { AuthModal } from "./AuthModal";
import { apiClient } from "@/lib/api-client";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickAdd: () => void;
}

export function Header({ onOpenMobileSidebar, onOpenQuickAdd }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme, competitions, tasks, user, setUser } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Compute urgent upcoming deadlines (within 7 days)
  const upcomingDeadlines = competitions
    .filter((c) => !c.archived && c.dates?.submissionDeadline)
    .map((c) => ({
      id: c.id,
      title: c.name,
      type: "Competition Submission",
      date: c.dates.submissionDeadline!,
      rel: getRelativeDeadline(c.dates.submissionDeadline),
    }))
    .filter((item) => item.rel.isUrgent || item.rel.isOverdue)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/competitions?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-border bg-card/80 px-3.5 backdrop-blur-md lg:px-5">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search competitions, projects, tags..."
            className="h-8 w-full rounded-lg border border-input bg-background/50 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
          />
        </form>
      </div>

      {/* Right: Quick Deadline Alerts, Theme, Avatar */}
      <div className="flex items-center gap-1.5">
        {/* Deadlines Notification Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {upcomingDeadlines.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card p-3 shadow-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-2 px-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary-500" />
                    <span>Urgent Deadlines</span>
                  </div>
                  <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:text-primary-400">
                    {upcomingDeadlines.length} Due Soon
                  </span>
                </div>

                {upcomingDeadlines.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No urgent deadlines in the next 7 days!
                  </div>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {upcomingDeadlines.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false);
                          router.push(`/competitions/${item.id}`);
                        }}
                        className="cursor-pointer rounded-xl p-2 text-left hover:bg-muted transition"
                      >
                        <p className="text-xs font-semibold text-foreground truncate">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">{item.type}</span>
                          <span
                            className={
                              item.rel.isOverdue
                                ? "text-rose-500 font-medium"
                                : "text-amber-500 font-medium"
                            }
                          >
                            {item.rel.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* User Badge & Menu */}
        <div className="relative pl-1.5 border-l border-border">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-muted transition"
            aria-label="User profile menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-400 text-[11px] font-bold text-white shadow-sm overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
              ) : user?.displayName ? (
                user.displayName.charAt(0).toUpperCase()
              ) : (
                "O"
              )}
            </div>
            <span className="hidden text-xs font-medium text-foreground sm:inline-block max-w-[90px] truncate">
              {user?.displayName || "Competitor"}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl animate-fade-in text-xs">
                <div className="p-2 border-b border-border mb-1">
                  <p className="font-bold text-foreground truncate">{user?.displayName || "Guest Competitor"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email || "Local storage"}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowAuthModal(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl p-2 text-foreground hover:bg-muted transition"
                >
                  <LogIn className="h-3.5 w-3.5 text-primary-500" />
                  <span>{user?.uid === "demo-user" || user?.uid === "guest-user" ? "Sign in / Sync" : "Switch Account"}</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setUser(null);
                    apiClient.auth.logout().catch(() => {});
                  }}
                  className="flex w-full items-center gap-2 rounded-xl p-2 text-rose-500 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
}
