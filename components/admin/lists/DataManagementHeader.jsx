"use client";

import React, { memo } from "react";
import { Plus, Download, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * DataManagementHeader Component
 * Tier 2 Command Header with contextual action buttons, refresh, and CSV export.
 */
const DataManagementHeader = memo(function DataManagementHeader({
  activeTab = "departments",
  onAdd,
  onRefresh,
  onExportCsv,
  loading = false,
  isExporting = false,
  totalCount = 0,
}) {
  const getTabLabel = () => {
    switch (activeTab) {
      case "departments":
        return "Departments";
      case "positions":
        return "Job Positions";
      case "leaders":
        return "Supervisors & Leaders";
      default:
        return "Data Records";
    }
  };

  const getAddButtonText = () => {
    if (activeTab === "departments") return "Add Department";
    if (activeTab === "positions") return "Add Position";
    return null;
  };

  const addButtonText = getAddButtonText();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Data Management
          </h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border/70 font-mono">
            <Layers className="size-3 text-muted-foreground" />
            {totalCount.toLocaleString()} {getTabLabel()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Master records for organization units, job classifications, and team leadership hierarchy
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Refresh list data"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={isExporting}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Export active tab data to CSV"
        >
          <Download className="size-3.5" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>

        {addButtonText && (
          <Button
            size="sm"
            onClick={onAdd}
            className="h-8 text-xs gap-1.5"
            aria-label={`Add new ${activeTab === "departments" ? "department" : "position"}`}
          >
            <Plus className="size-3.5" />
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
});

export default DataManagementHeader;
