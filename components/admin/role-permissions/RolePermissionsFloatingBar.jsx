"use client";

import React, { memo } from "react";
import { AlertCircle, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/**
 * RolePermissionsFloatingBar Component
 * Sleek floating drawer at the bottom of the viewport that surfaces when permissions are staged.
 */
const RolePermissionsFloatingBar = memo(function RolePermissionsFloatingBar({
  modifiedCount = 0,
  saving = false,
  onSave,
  onDiscard,
}) {
  if (modifiedCount === 0) return null;

  return (
    <div
      role="region"
      aria-label="Pending staged permission changes"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-4 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl">
        {/* Change Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex size-2.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground tracking-tight">
              Unsaved Permissions Staged
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {modifiedCount} {modifiedCount === 1 ? "modification" : "modifications"} ready to be saved
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={saving}
            className="h-8 text-xs border-border/80 gap-1.5"
            aria-label="Discard all pending permission changes"
          >
            <Undo2 className="size-3.5" />
            <span>Discard</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={saving}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs font-medium"
            aria-label="Save staged permission changes"
          >
            {saving ? (
              <LoadingSpinner size="sm" className="size-3.5 mr-1" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
});

export default RolePermissionsFloatingBar;
