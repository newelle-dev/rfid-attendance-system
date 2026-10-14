"use client";

import React, { memo } from "react";
import { ShieldAlert, RefreshCw, AlertCircle, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * LoadingState Component
 */
export const LoadingState = memo(function LoadingState({
  message = "Loading security permissions matrix...",
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
  onResetFilters,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-border/80 bg-muted/10">
      <div className="rounded-full bg-muted p-3 mb-3 border border-border/60">
        <FilterX className="size-5 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-semibold text-foreground">
        {hasFilters ? "No matching modules found" : "No permission rules configured"}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
        {hasFilters
          ? "No system modules match your search or category filter. Try clearing your filters to view all 5 modules."
          : "System permissions are currently empty. Click 'Restore Baseline' to populate default access rules."}
      </p>

      {hasFilters && onResetFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="h-8 text-xs border-border"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
});

/**
 * ErrorState Component
 */
export const ErrorState = memo(function ErrorState({
  error = "Failed to load permissions matrix",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="rounded-full bg-destructive/10 p-2.5 mb-2.5">
        <AlertCircle className="size-5 text-destructive" />
      </div>

      <h3 className="text-sm font-semibold text-destructive">
        Unable to load permissions matrix
      </h3>
      <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
        {typeof error === "string" ? error : "An unexpected server or database error occurred."}
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
