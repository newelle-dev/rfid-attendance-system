'use client';

import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        {children}
      </SessionProvider>
    </ErrorBoundary>
  );
}