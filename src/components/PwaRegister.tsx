"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-primary-500/30 bg-card p-4 shadow-xl backdrop-blur-md animate-fade-in max-w-sm">
      <div className="rounded-lg bg-primary-500/10 p-2.5 text-primary-500">
        <Download className="h-5 w-5" />
      </div>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-foreground">Install OBHIJAAN</p>
        <p className="text-xs text-muted-foreground">Add to home screen for offline access</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleInstallClick}
          className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 transition"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
