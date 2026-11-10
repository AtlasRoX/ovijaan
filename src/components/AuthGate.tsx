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
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser, setAuthLoading } = useAppStore();

  const [tab, setTab] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    apiClient.auth
      .getMe()
      .then((res) => {
        if (!isMounted) return;
        if (res?.user) {
          setUser(res.user);
        } else if (user?.uid !== "guest-mode") {
          setUser(null);
        }
      })
      .catch(() => {
        if (isMounted && user?.uid !== "guest-mode") {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setUser, setAuthLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (tab === "login") {
        const loggedUser = await apiClient.auth.login(email, password);
        setUser(loggedUser);
      } else if (tab === "signup") {
        const newUser = await apiClient.auth.signup(email, password, displayName);
        setUser(newUser);
      } else if (tab === "forgot") {
        await apiClient.auth.resetPassword(email);
        setSuccessMsg("Password reset link sent! Check your inbox.");
      }
    } catch (err: any) {
      console.error(err);
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
      const loggedUser = await apiClient.auth.googleLogin();
      setUser(loggedUser);
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestAccess = async () => {
    setSubmitting(true);
    try {
      const guest = await apiClient.auth.guestLogin();
      setUser(guest);
    } catch (err: any) {
      setUser({
        uid: "guest-mode",
        email: "guest@obhijaan.local",
        displayName: "Guest Competitor",
        role: "guest",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Ambient backdrop glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[380px] w-[600px] rounded-full bg-gradient-to-b from-primary-500/15 via-primary-500/5 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-[340px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="relative w-full max-w-[390px] mx-auto z-10 animate-fade-in space-y-4">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="relative mx-auto h-12 w-48 transition hover:opacity-95">
            <Image
              src="/logo.png"
              alt="OBHIJAAN"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Welcome to OBHIJAAN
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Private workspace for competitions and project milestones.
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-5 sm:p-6 shadow-2xl shadow-black/25">
          {/* Subtle top edge glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-muted/70 p-1 border border-border/40 mb-4">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-semibold transition duration-150",
                tab === "login"
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError(null);
                setSuccessMsg(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-semibold transition duration-150",
                tab === "signup"
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-500 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-3.5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-500 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{successMsg}</span>
            </div>
          )}

          {/* Google Button */}
          {tab !== "forgot" && (
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="flex h-9.5 w-full items-center justify-center gap-2.5 rounded-xl border border-border/80 bg-background/60 hover:bg-muted/80 text-xs font-semibold text-foreground transition disabled:opacity-50 hover:border-border active:scale-[0.99]"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                  <span className="bg-card px-2 text-muted-foreground/80">or with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "signup" && (
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Full name"
                    className="h-9 w-full rounded-xl border border-input bg-background/70 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-9 w-full rounded-xl border border-input bg-background/70 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
                />
              </div>
            </div>

            {tab !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-foreground">Password</label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab("forgot");
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-medium text-primary-500 hover:text-primary-400 hover:underline transition"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 w-full rounded-xl border border-input bg-background/70 pl-8.5 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-9.5 w-full rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold shadow-md shadow-primary-600/20 active:scale-[0.99] transition duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
            >
              {submitting
                ? "Processing..."
                : tab === "login"
                ? "Sign In"
                : tab === "signup"
                ? "Create Account"
                : "Send Reset Link"}
            </button>
          </form>

          {tab === "forgot" && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setTab("login")}
                className="text-xs font-medium text-primary-500 hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Guest Mode Fallback */}
          <div className="mt-4 pt-3.5 border-t border-border/50 text-center">
            <button
              onClick={handleGuestAccess}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition inline-flex items-center gap-1 group"
            >
              <span>Explore in Guest Mode (Offline Only)</span>
              <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <span>Private, authenticated workspace • Zero public sharing</span>
        </div>
      </div>
    </div>
  );
}
