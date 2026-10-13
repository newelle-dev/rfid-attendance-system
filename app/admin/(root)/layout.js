"use client";

import { useState, useEffect } from 'react';
import SideNav from '@/components/admin/layout/SideNav';
import SideNavSkeleton from '@/components/admin/layout/SideNavSkeleton';
import Header from '@/components/admin/layout/Header';
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  // Only render full dynamic layout after initial mount to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <SideNavSkeleton collapsed={sideNavCollapsed} />
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="h-16 bg-white border-b border-gray-200 shadow-sm" />
          <main className="flex-1 p-4 md:p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/4" />
              <div className="h-32 bg-slate-200 rounded" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleSideNavToggle = () => {
    setSideNavCollapsed(!sideNavCollapsed);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex">
        <SideNav 
          collapsed={sideNavCollapsed}
        />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header 
            onMenuToggle={handleSideNavToggle}
            isCollapsed={sideNavCollapsed}
          />
          <main className="flex-1 transition-all duration-300 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </>
  );
}