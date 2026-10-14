"use client";

import React, { memo } from "react";
import { FileText, RefreshCw, AlertCircle, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * LoadingState Component
 */
export const LoadingState = memo(function LoadingState({
  message = "Loading attendance logs...",
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
  onRefresh,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-border/80 bg-muted/10">
      <div className="rounded-full bg-muted p-3 mb-3 border border-border/60">
        {hasFilters ? (
          <FilterX className="size-5 text-muted-foreground" />
        ) : (
          <FileText className="size-5 text-muted-foreground" />
        )}
      </div>

      <h3 className="text-sm font-semibold text-foreground">
        {hasFilters ? "No matching attendance logs" : "No attendance logs recorded yet"}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
        {hasFilters
          ? "No swipe logs match your current search, department, status, or date range filters. Try resetting all filters."
          : "Attendance swipe events will automatically appear here once personnel scan their RFID cards at terminal kiosks."}
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
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            Check for New Punches
          </Button>
        )}
      </div>
    </div>
  );
});

/**
 * ErrorState Component
 */
export const ErrorState = memo(function ErrorState({
  error = "Failed to load attendance logs",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="rounded-full bg-destructive/10 p-2.5 mb-2.5">
        <AlertCircle className="size-5 text-destructive" />
      </div>

      <h3 className="text-sm font-semibold text-destructive">
        Unable to load attendance logs
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
        {error}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
        >
          <RefreshCw className="size-3.5 mr-1.5" />
          Retry Connection
        </Button>
      )}
    </div>
  );
});

/**
 * Default AttendanceStates wrapper component
 */
export default function AttendanceStates({
  loading = false,
  error = null,
  showEmptyState = false,
  hasFiltersOrSearch = false,
  onRefresh,
  onResetFilters,
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRefresh} />;
  if (showEmptyState)
    return (
      <EmptyState
        hasFilters={hasFiltersOrSearch}
        onResetFilters={onResetFilters}
        onRefresh={onRefresh}
      />
    );
  return null;
}
