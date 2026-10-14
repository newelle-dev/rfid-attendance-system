"use client";

import React, { memo } from "react";
import { Building2, Briefcase, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DataManagementStatsCards Component
 * Tier 3 Interactive KPI Metric Strip for organization structure metrics.
 */
const DataManagementStatsCards = memo(function DataManagementStatsCards({
  stats = {
    totalDepartments: 0,
    totalPositions: 0,
    leadershipPositions: 0,
    activeLeaders: 0,
  },
  loading = false,
  activeTab = "departments",
  positionFilter = "all",
  onKpiClick,
}) {
  const cards = [
    {
      id: "departments",
      label: "Departments",
      value: stats.totalDepartments,
      subtext: "Operational divisions",
      icon: Building2,
      indicatorDot: "bg-blue-500",
      isActive: activeTab === "departments",
    },
    {
      id: "positions",
      label: "Job Positions",
      value: stats.totalPositions,
      subtext: "Role classifications",
      icon: Briefcase,
      indicatorDot: "bg-emerald-500",
      isActive: activeTab === "positions" && positionFilter !== "leaders",
    },
    {
      id: "leadership",
      label: "Leadership Roles",
      value: stats.leadershipPositions,
      subtext: "Supervisor positions",
      icon: ShieldCheck,
      indicatorDot: "bg-purple-500",
      isActive: activeTab === "positions" && positionFilter === "leaders",
    },
    {
      id: "leaders",
      label: "Active Leaders",
      value: stats.activeLeaders,
      subtext: "Assigned supervisors",
      icon: Users,
      indicatorDot: "bg-amber-500",
      isActive: activeTab === "leaders",
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
            onClick={() => onKpiClick && onKpiClick(card.id)}
            className={cn(
              "group relative flex flex-col justify-between p-4 rounded-lg border text-left transition-all duration-150 outline-none select-none",
              "bg-card hover:bg-muted/40",
              card.isActive
                ? "border-foreground/40 bg-muted/20 ring-1 ring-foreground/20"
                : "border-border/80"
            )}
            aria-pressed={card.isActive}
            aria-label={`Switch to ${card.label}`}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-xs font-medium text-muted-foreground tracking-tight">
                {card.label}
              </span>
              <div className="flex items-center gap-1.5">
                {card.indicatorDot && (
                  <span
                    className={cn(
                      "size-1.5 rounded-full shrink-0",
                      card.indicatorDot
                    )}
                    aria-hidden="true"
                  />
                )}
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

export default DataManagementStatsCards;
