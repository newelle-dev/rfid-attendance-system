"use client";

import React, { memo } from "react";
import { 
  ShieldAlert, 
  RotateCcw, 
  Download, 
  RefreshCw, 
  LayoutGrid, 
  SquareKanban
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * RolePermissionsHeader Component
 * Tier 2 Command Header with view switcher, baseline reset trigger, CSV export, and refresh.
 */
const RolePermissionsHeader = memo(function RolePermissionsHeader({
  activeView,
  onViewChange,
  onOpenBaselineModal,
  onRefresh,
  onExportCsv,
  loading = false,
  isExporting = false,
  hasChanges = false
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Role Permissions
          </h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20 font-mono">
            <ShieldAlert className="size-3 text-rose-500" />
            Superadmin Authority
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/70 font-mono">
            4 Roles • 5 Modules
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Define global role-based access control (RBAC) rules, module accessibility, and departmental security policies.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* View Switcher Segmented Control */}
        <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("matrix")}
            className={`h-7 px-2.5 text-xs font-medium rounded-md transition-colors gap-1.5 ${
              activeView === "matrix"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Switch to 2D Matrix Grid View"
          >
            <LayoutGrid className="size-3.5" />
            <span className="hidden sm:inline">Matrix Grid</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onViewChange("cards")}
            className={`h-7 px-2.5 text-xs font-medium rounded-md transition-colors gap-1.5 ${
              activeView === "cards"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Switch to Role Inspector Cards View"
          >
            <SquareKanban className="size-3.5" />
            <span className="hidden sm:inline">Role Cards</span>
          </Button>
        </div>

        {/* Restore Recommended Baseline Preset */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenBaselineModal}
          disabled={loading}
          className="h-8 text-xs border-border/80 gap-1.5 text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:bg-amber-500/10"
          aria-label="Restore system recommended security baseline"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden md:inline">Reset Baseline</span>
        </Button>

        {/* Export RBAC Policy CSV */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={isExporting || loading}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Export RBAC permission matrix to CSV"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export CSV"}</span>
        </Button>

        {/* Refresh Data */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Refresh role permissions data"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </div>
  );
});

export default RolePermissionsHeader;
