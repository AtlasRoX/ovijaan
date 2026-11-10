"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  User,
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types";

interface AuthGateProps {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}

export function AuthGate({ children, initialUser }: AuthGateProps) {
  const { user, setUser } = useAppStore();

  const [tab, setTab] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Track whether we've finished the initial hydration check
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Priority 1: server session
    if (initialUser) {
      setUser(initialUser);
      setHydrated(true);
      return;
    }
    // Priority 2: localStorage fallback
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("obhijaan_user_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.uid) {
            setUser(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
    setHydrated(true);
  }, []); // run once on mount only

  const handleAuthSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      if (tab === "login") {
        const loggedUser = await apiClient.auth.login(email.trim(), password);
        handleAuthSuccess(loggedUser);
      } else if (tab === "signup") {
        const newUser = await apiClient.auth.signup(email.trim(), password, displayName.trim());
        handleAuthSuccess(newUser);
      } else if (tab === "forgot") {
        await apiClient.auth.resetPassword(email.trim());
        setSuccessMsg("Password reset link sent! Check your inbox.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const { auth, googleProvider } = await import("@/lib/firebase-client");
      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const loggedUser = await apiClient.auth.googleLogin(idToken);
      handleAuthSuccess(loggedUser);
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestAccess = async () => {
    setSubmitting(true);
    try {
      const guest = await apiClient.auth.guestLogin();
      handleAuthSuccess(guest);
    } catch {
      handleAuthSuccess({
        uid: "guest-mode",
        email: "guest@obhijaan.local",
        displayName: "Guest Competitor",
        role: "guest",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Before hydration completes, show nothing to avoid auth flash
  if (!hydrated) return null;

  // Authenticated: show the app
  if (user) return <>{children}</>;

  // — Auth screen —
  return (
    <div className="relative min-h-screen w-full bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm z-10 space-y-5">
        {/* Brand */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto h-10 w-40">
            <Image src="/logo.png" alt="OBHIJAAN" fill className="object-contain dark:invert" priority />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your workspace</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-lg p-6 space-y-4">

          {/* Tab switcher */}
          {tab !== "forgot" && (
            <div className="flex rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => { setTab("login"); setError(null); setSuccessMsg(null); }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-semibold transition",
                  tab === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab("signup"); setError(null); setSuccessMsg(null); }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-semibold transition",
                  tab === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google */}
          {tab !== "forgot" && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background hover:bg-muted text-sm font-medium text-foreground transition disabled:opacity-50"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">or continue with email</span>
                </div>
              </div>
            </>
          )}

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "signup" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                />
              </div>
            </div>

            {tab !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => { setTab("forgot"); setError(null); setSuccessMsg(null); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {submitting ? "Please wait…" : tab === "login" ? "Sign In" : tab === "signup" ? "Create Account" : "Send Reset Link"}
            </button>
          </form>

          {tab === "forgot" && (
            <button
              type="button"
              onClick={() => setTab("login")}
              className="w-full text-sm text-muted-foreground hover:text-foreground text-center transition"
            >
              ← Back to Sign In
            </button>
          )}
        </div>

        {/* Guest + security */}
        <div className="space-y-2 text-center">
          <button
            type="button"
            onClick={handleGuestAccess}
            disabled={submitting}
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-50"
          >
            <Compass className="h-3.5 w-3.5 text-primary transition-transform duration-200 group-hover:rotate-45" />
            <span>Explore in Guest Mode (no account needed)</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Private workspace · Zero public sharing
          </div>
        </div>
      </div>
    </div>
  );
}
