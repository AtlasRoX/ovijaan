"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { QuickAddModal } from "./QuickAddModal";
import { PwaRegister } from "./PwaRegister";
import { AuthGate } from "./AuthGate";
import { UserProfile } from "@/types";

export function AppShell({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <AuthGate initialUser={initialUser}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col lg:pl-56">
          <Header
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            onOpenQuickAdd={() => setQuickAddOpen(true)}
          />
          <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-6xl w-full mx-auto animate-fade-in">
            {children}
          </main>
        </div>

        <QuickAddModal
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
        />

        <PwaRegister />
      </div>
    </AuthGate>
  );
}
