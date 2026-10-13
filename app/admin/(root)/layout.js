"use client";

import { useState, useEffect } from 'react';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { X } from 'lucide-react';
import SideNav from '@/components/admin/layout/SideNav';
import SideNavSkeleton from '@/components/admin/layout/SideNavSkeleton';
import Header from '@/components/admin/layout/Header';
import { Button } from "@/components/ui/button";

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

  // Custom action for closing snackbars
  const notistackAction = snackbarId => (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0" 
      onClick={() => closeSnackbar(snackbarId)}
    >
      <X className="h-4 w-4" />
    </Button>
  );

  const handleSideNavToggle = () => {
    setSideNavCollapsed(!sideNavCollapsed);
  };

  return (
    <SnackbarProvider 
      maxSnack={3} 
      autoHideDuration={4000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      action={notistackAction}
      classes={{
        variantSuccess: 'bg-green-500',
        variantError: 'bg-red-500',
        variantWarning: 'bg-yellow-500',
        variantInfo: 'bg-blue-500',
      }}
    >
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
      </SnackbarProvider>
  );
}