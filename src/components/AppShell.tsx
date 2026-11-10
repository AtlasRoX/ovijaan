"use client";

import { useState, useEffect } from "react";
import { TopBar } from "./TopBar";
import { QuickAddModal } from "./QuickAddModal";
import { PwaRegister } from "./PwaRegister";
import { AuthGate } from "./AuthGate";
import { useAppStore } from "@/lib/store";
import { UserProfile } from "@/types";

export function AppShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const initTheme = useAppStore((s) => s.initTheme);

  // Apply persisted theme on mount (light is the default if nothing stored)
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <AuthGate initialUser={initialUser}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <TopBar onOpenQuickAdd={() => setQuickAddOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>

        <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

        <PwaRegister />
      </div>
    </AuthGate>
  );
}
