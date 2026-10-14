"use client";

import React, { memo } from "react";
import { Users, UserPlus, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * LoadingState Component
 */
export const LoadingState = memo(function LoadingState({
  message = "Loading personnel roster...",
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
  onAddEmployee,
  onResetFilters,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-border/80 bg-muted/10">
      <div className="rounded-full bg-muted p-3 mb-3 border border-border/60">
        <Users className="size-5 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-semibold text-foreground">
        {hasFilters ? "No matching employees found" : "No employees registered yet"}
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
        {hasFilters
          ? "No personnel match your search or filter criteria. Try adjusting your query or resetting all filters."
          : "Get started by registering your first employee and assigning their RFID badge credential."}
      </p>

      <div className="flex items-center gap-2">
        {hasFilters ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="h-8 text-xs border-border"
            >
              Clear Filters
            </Button>
            <Button
              size="sm"
              onClick={onAddEmployee}
              className="h-8 text-xs gap-1.5"
            >
              <UserPlus className="size-3.5" />
              Add Employee
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={onAddEmployee}
            className="h-8 text-xs gap-1.5"
          >
            <UserPlus className="size-3.5" />
            Add First Employee
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
  error = "Failed to load employee records",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-lg border border-destructive/30 bg-destructive/5">
      <div className="rounded-full bg-destructive/10 p-2.5 mb-2.5">
        <AlertCircle className="size-5 text-destructive" />
      </div>

      <h3 className="text-sm font-semibold text-destructive">
        Unable to load employee roster
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
