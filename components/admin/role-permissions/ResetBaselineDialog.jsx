"use client";

import React, { memo } from "react";
import { RotateCcw, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * ResetBaselineDialog Component
 * Confirmation dialog before applying the system-recommended RBAC security baseline.
 */
const ResetBaselineDialog = memo(function ResetBaselineDialog({
  open,
  onOpenChange,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-500 mb-1">
            <div className="p-2 rounded-full bg-amber-500/10">
              <RotateCcw className="size-4" />
            </div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Restore Recommended Security Baseline?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            This will stage the recommended role-based access control rules across all 4 system roles. 
            You can still review the modifications before saving.
          </DialogDescription>
        </DialogHeader>

        {/* Baseline Breakdown Summary */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-2 text-xs">
          <div className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Standard Baseline Configuration
          </div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex justify-between">
              <span className="font-medium text-foreground">Super Admin:</span>
              <span>All 5 Modules (Full Root Control)</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-foreground">Admin:</span>
              <span>4 Modules (All except Role Permissions)</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-foreground">HR:</span>
              <span>Employees & Attendance Logs</span>
            </li>
            <li className="flex justify-between">
              <span className="font-medium text-foreground">Security:</span>
              <span>Attendance Logs Terminal</span>
            </li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs border-border/80"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Apply Baseline Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default ResetBaselineDialog;
