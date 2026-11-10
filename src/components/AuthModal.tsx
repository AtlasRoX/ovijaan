"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Mail, Lock, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  signInGoogle,
  loginWithEmail,
  registerWithEmail,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { useAppStore } from "@/lib/store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setUser } = useAppStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await loginWithEmail(email, password);
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || email.split("@")[0],
          photoURL: res.user.photoURL,
        });
      } else {
        const res = await registerWithEmail(email, password);
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: email.split("@")[0],
          photoURL: null,
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message?.replace("Firebase: ", "") || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signInGoogle();
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || "Obhijaan Competitor",
        photoURL: res.user.photoURL,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message?.replace("Firebase: ", "") || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setUser({
      uid: "guest-user",
      email: "guest@obhijaan.local",
      displayName: "Guest Competitor",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand */}
        <div className="text-center">
          <div className="relative mx-auto h-10 w-32">
            <Image
              src="/logo.png"
              alt="OBHIJAAN"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">
            {mode === "login" ? "Sign in to OBHIJAAN" : "Create Private Account"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            One secure workspace for your hackathons and project journey.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-in Button */}
        {isFirebaseConfigured && (
          <div className="mt-5">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition disabled:opacity-50"
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

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground">Password</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="hover:text-primary-500 underline"
          >
            {mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
          <button onClick={handleGuestMode} className="text-xs text-muted-foreground hover:text-foreground">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
