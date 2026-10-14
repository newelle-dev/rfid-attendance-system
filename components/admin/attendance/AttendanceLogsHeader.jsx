"use client";

import React, { memo } from "react";
import { Download, RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * AttendanceLogsHeader Component
 * Tier 2 Command Header: Module title, record counters, live auto-refresh toggle, and action buttons.
 */
const AttendanceLogsHeader = memo(function AttendanceLogsHeader({
  totalLogs = 0,
  onRefresh,
  loading = false,
  autoRefresh = false,
  onToggleAutoRefresh,
  onExportCsv,
  isExporting = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Attendance Logs
          </h1>
          <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
            {totalLogs.toLocaleString()} {totalLogs === 1 ? "Record" : "Records"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Live RFID kiosk swipe events, shift duration tracking, and terminal attendance archives
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Live Auto-Refresh Toggle */}
        <Button
          type="button"
          variant={autoRefresh ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleAutoRefresh}
          className="h-8 text-xs border-border/80 gap-1.5 transition-all"
          title="Toggle 30-second live auto-polling"
        >
          {autoRefresh ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Live (30s)
              </span>
            </>
          ) : (
            <>
              <Radio className="size-3.5 text-muted-foreground" />
              <span>Live Poll: Off</span>
            </>
          )}
        </Button>

        {/* Manual Refresh */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Refresh attendance logs"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>

        {/* Export CSV */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={isExporting || totalLogs === 0}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Export attendance logs to CSV"
        >
          <Download className="size-3.5" />
          <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
        </Button>
      </div>
    </div>
  );
});

export default AttendanceLogsHeader;
