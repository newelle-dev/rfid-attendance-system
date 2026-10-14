"use client";

import React, { memo } from "react";
import { FileText, UserCheck, CheckCircle2, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AttendanceStatsCards Component
 * Tier 3 KPI Metric Strip: Interactive metrics for attendance sessions with click-to-filter support.
 */
const AttendanceStatsCards = memo(function AttendanceStatsCards({
  stats = { total_logs: 0, in_only: 0, complete_logs: 0, todayCount: 0 },
  loading = false,
  activeLogType = "ALL",
  activeDatePreset = "all",
  onKpiClick,
}) {
  const cards = [
    {
      id: "total_logs",
      label: "Total Logs",
      value: stats.total_logs,
      subtext: "All historical records",
      icon: FileText,
      isSelected: activeLogType === "ALL" && activeDatePreset === "all",
    },
    {
      id: "in_only",
      label: "Currently On-Premise",
      value: stats.in_only,
      subtext: "Active shift now",
      icon: UserCheck,
      isPulse: true,
      isSelected: activeLogType === "IN",
    },
    {
      id: "complete_logs",
      label: "Completed Shifts",
      value: stats.complete_logs,
      subtext: "Clocked in & out",
      icon: CheckCircle2,
      dotClass: "bg-blue-500",
      isSelected: activeLogType === "OUT",
    },
    {
      id: "todayCount",
      label: "Active Today",
      value: stats.todayCount,
      subtext: "Unique staff punched",
      icon: CalendarCheck,
      dotClass: "bg-amber-500",
      isSelected: activeDatePreset === "today",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onKpiClick?.(card.id)}
            className={cn(
              "group relative flex flex-col justify-between p-4 rounded-lg border text-left transition-all duration-150 outline-none select-none",
              "bg-card hover:bg-muted/40",
              card.isSelected
                ? "border-foreground/40 bg-muted/20 ring-1 ring-foreground/20"
                : "border-border/80"
            )}
            aria-pressed={card.isSelected}
            aria-label={`Filter by ${card.label}`}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-xs font-medium text-muted-foreground tracking-tight">
                {card.label}
              </span>
              <div className="flex items-center gap-1.5">
                {card.isPulse ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                ) : card.dotClass ? (
                  <span
                    className={cn("size-1.5 rounded-full shrink-0", card.dotClass)}
                    aria-hidden="true"
                  />
                ) : null}
                <Icon
                  className="size-3.5 text-muted-foreground/70 group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              {loading ? (
                <div className="h-7 w-12 rounded bg-muted animate-pulse" />
              ) : (
                <span className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                  {card.value.toLocaleString()}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground/80 truncate">
                {card.subtext}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
});

export default AttendanceStatsCards;
