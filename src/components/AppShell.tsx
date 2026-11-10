"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { QuickAddModal } from "./QuickAddModal";
import { PwaRegister } from "./PwaRegister";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />

      <PwaRegister />
    </div>
  );
}
