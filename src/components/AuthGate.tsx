"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trophy,
  FolderKanban,
  CheckSquare,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  getFirebaseAuth,
  signInGoogle,
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Competitor",
          photoURL: firebaseUser.photoURL,
        });
      } else {
        // If not in guest mode, clear user
        if (user?.uid !== "guest-mode") {
          setUser(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (tab === "login") {
        const res = await loginWithEmail(email, password);
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || email.split("@")[0],
          photoURL: res.user.photoURL,
        });
      } else if (tab === "signup") {
        const res = await registerWithEmail(email, password);
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: displayName.trim() || email.split("@")[0],
          photoURL: null,
        });
      } else if (tab === "forgot") {
        await sendPasswordReset(email);
        setSuccessMsg("Password reset email sent! Check your inbox.");
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Authentication error occurred.";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/user-not-found")) {
        msg = "Invalid email or password. Please check your credentials.";
      } else if (msg.includes("auth/email-already-in-use")) {
        msg = "An account with this email already exists. Try signing in.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const res = await signInGoogle();
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || "Obhijaan Competitor",
        photoURL: res.user.photoURL,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message?.replace("Firebase: ", "") || "Google sign-in was cancelled or failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestAccess = () => {
    setUser({
      uid: "guest-mode",
      email: "guest@obhijaan.local",
      displayName: "Guest Competitor",
    });
  };

  // 1. Loading Splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="relative h-14 w-40 animate-pulse">
          <Image
            src="/logo.png"
            alt="OBHIJAAN"
            fill
            className="object-contain dark:invert"
            priority
          />
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground font-semibold">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <span>Restoring secure session...</span>
        </div>
      </div>
    );
  }

  // 2. If authenticated or guest, render full application
  if (user) {
    return <>{children}</>;
  }

  // 3. Dedicated Full-Page Production Authentication Portal
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="relative mx-auto h-16 w-48">
          <Image
            src="/logo.png"
            alt="OBHIJAAN"
            fill
            className="object-contain dark:invert"
            priority
          />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          Welcome to OBHIJAAN
        </h1>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          One account, one private workspace, one source of truth for your hackathons and project milestones.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          {/* Tab selector */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 mb-6">
            <button
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`rounded-lg py-2 text-xs font-semibold transition ${
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
              className={`rounded-lg py-2 text-xs font-semibold transition ${
                tab === "signup"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign In */}
          {isFirebaseConfigured && tab !== "forgot" && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or with email</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === "signup" && (
              <div>
                <label className="text-xs font-medium text-foreground">Your Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {tab !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Password</label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab("forgot");
                        setError(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-primary-500 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50"
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
            <div className="mt-4 text-center">
              <button
                onClick={() => setTab("login")}
                className="text-xs text-primary-500 hover:underline"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Guest fallback button */}
          <div className="mt-5 pt-4 border-t border-border text-center">
            <button
              onClick={handleGuestAccess}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition"
            >
              Explore in Guest Mode (Offline Only) →
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Private, authenticated workspace • Zero public sharing</span>
        </div>
      </div>
    </div>
  );
}
