"use client";

import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

/**
 * Client-side provider wrapper for the Admin portal subtree.
 * Isolates React Context and client-only boundaries (NextAuth SessionProvider, ErrorBoundary)
 * so that app/admin/layout.js can remain a pure React Server Component.
 */
export default function AdminProviders({ children }) {
  return (
    <ErrorBoundary>
      <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
        {children}
      </SessionProvider>
    </ErrorBoundary>
  );
}
