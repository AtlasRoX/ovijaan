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
  Server,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/lib/store";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser, authLoading, setAuthLoading } = useAppStore();

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
        setSuccessMsg("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication error occurred.");
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

  const handleGoogleLogin = () => {
    setError("Server isolation active: Please sign in with email and password.");
  };

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center py-8 px-4 animate-fade-in">
      <div className="w-full max-w-[340px] text-center">
        {/* Compact Logo */}
        <div className="relative mx-auto h-11 w-44">
          <Image
            src="/logo.png"
            alt="OBHIJAAN"
            fill
            className="object-contain dark:invert"
            priority
          />
        </div>
        <h1 className="mt-2.5 text-base font-bold tracking-tight text-foreground">
          Welcome to OBHIJAAN
        </h1>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
          Private workspace for competitions and project milestones.
        </p>
      </div>

      <div className="mt-4 w-full max-w-[340px]">
        <div className="rounded-xl border border-border bg-card p-4 shadow-lg">
          {/* Compact Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-0.5 mb-3.5">
            <button
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`rounded-md py-1 text-[11px] font-semibold transition ${
                tab === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("signup");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`rounded-md py-1 text-[11px] font-semibold transition ${
                tab === "signup"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-[11px] text-rose-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-3 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Button */}
          {tab !== "forgot" && (
            <div className="mb-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
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

              <div className="relative my-2.5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {tab === "signup" && (
              <div>
                <label className="text-[11px] font-medium text-foreground">Your Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Full name"
                    className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-2.5 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-foreground">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-2.5 text-xs focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {tab !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-foreground">Password</label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab("forgot");
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[10px] text-primary-500 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-2.5 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-lg bg-primary-600 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50"
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
                className="text-[11px] text-primary-500 hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Guest fallback button */}
          <div className="mt-3.5 pt-3 border-t border-border text-center">
            <button
              onClick={handleGuestAccess}
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium transition"
            >
              Explore in Guest Mode (Offline Only) →
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Private, authenticated workspace</span>
        </div>
      </div>
    </div>
  );
}
