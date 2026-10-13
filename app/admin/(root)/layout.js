"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SideNav from "@/components/admin/layout/SideNav";
import SideNavSkeleton from "@/components/admin/layout/SideNavSkeleton";
import Header from "@/components/admin/layout/Header";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-background flex">
        <SideNavSkeleton />
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="h-16 bg-background border-b border-border shadow-2xs" />
          <main className="flex-1 p-4 md:p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <SideNav />
      <SidebarInset className="min-h-screen bg-slate-50/60 dark:bg-background flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </SidebarProvider>
  );
}