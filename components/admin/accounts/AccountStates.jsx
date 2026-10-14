"use client";

import React, { memo } from "react";
import { ShieldAlert, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * LoadingState Component
 */
export const LoadingState = memo(function LoadingState({
  message = "Loading administrative accounts...",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <RefreshCw className="size-6 animate-spin text-muted-foreground/80" />
      <p className="text-xs text-muted-foreground font-medium" aria-live="polite">
        {message}
      </p>
    </div>
  );
});

/**
 * EmptyState Component
 */
export const EmptyState = memo(function EmptyState({
  hasFilters = false,
  onAdd,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-border/80 bg-muted/10">
      <div className="rounded-full bg-muted p-3 mb-3 border border-border/60">
        <ShieldAlert className="size-5 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-semibold text-foreground">
        {hasFilters ? "No matching accounts found" : "No admin accounts registered"}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
        {hasFilters
          ? "No account records match your search or role filter criteria. Try adjusting your query or resetting filters."
          : "Get started by adding your organization's administrators, security officers, or HR managers."}
      </p>

      <div className="flex items-center gap-2">
        {hasFilters ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs border-border"
          >
            Clear Filters
          </Button>
        ) : (
          onAdd && (
            <Button size="sm" onClick={onAdd} className="h-8 text-xs gap-1.5">
              <Plus className="size-3.5" />
              Add First Account
            </Button>
          )
        )}
      </div>
    </div>
  );
});

/**
 * ErrorState Component
 */
export const ErrorState = memo(function ErrorState({
  error = "Failed to load account records",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="rounded-full bg-destructive/10 p-2.5 mb-2.5">
        <AlertCircle className="size-5 text-destructive" />
      </div>

      <h3 className="text-sm font-semibold text-destructive">
        Unable to load account directory
      </h3>
      <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
        {typeof error === "string" ? error : "An unexpected server or network error occurred."}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5"
        >
          <RefreshCw className="size-3.5" />
          Retry Connection
        </Button>
      )}
    </div>
  );
});
