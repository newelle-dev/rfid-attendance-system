"use client";

import React, { memo } from "react";
import { Users, UserCheck, UserMinus, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * EmployeeStatsCards Component
 * Minimalist, flat-bordered KPI strip for employee status metrics with interactive filtering.
 */
const EmployeeStatsCards = memo(function EmployeeStatsCards({
  stats = { total: 0, active: 0, inactive: 0, resigned: 0 },
  loading = false,
  activeStatusFilter = "",
  onStatusFilterChange,
}) {
  const cards = [
    {
      id: "total",
      label: "Total Workforce",
      value: stats.total,
      subtext: "Registered records",
      icon: Users,
      filterValue: "",
      accent: "text-foreground",
      badgeClass: "bg-muted text-foreground border-border",
    },
    {
      id: "active",
      label: "Active",
      value: stats.active,
      subtext: "Ready for punch-in",
      icon: UserCheck,
      filterValue: "active",
      accent: "text-foreground",
      indicatorDot: "bg-emerald-500",
      badgeClass: "bg-muted text-foreground border-border",
    },
    {
      id: "inactive",
      label: "Inactive",
      value: stats.inactive,
      subtext: "Suspended or on-leave",
      icon: UserMinus,
      filterValue: "inactive",
      accent: "text-foreground",
      indicatorDot: "bg-amber-500",
      badgeClass: "bg-muted text-foreground border-border",
    },
    {
      id: "resigned",
      label: "Resigned",
      value: stats.resigned,
      subtext: "Archived & offboarded",
      icon: UserX,
      filterValue: "resigned",
      accent: "text-foreground",
      indicatorDot: "bg-zinc-400 dark:bg-zinc-600",
      badgeClass: "bg-muted text-foreground border-border",
    },
  ];

  const handleCardClick = (filterValue) => {
    if (!onStatusFilterChange) return;
    if (activeStatusFilter === filterValue) {
      onStatusFilterChange("");
    } else {
      onStatusFilterChange(filterValue);
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected =
          card.id === "total"
            ? !activeStatusFilter
            : activeStatusFilter === card.filterValue;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => handleCardClick(card.filterValue)}
            className={cn(
              "group relative flex flex-col justify-between p-4 rounded-lg border text-left transition-all duration-150 outline-none select-none",
              "bg-card hover:bg-muted/40",
              isSelected
                ? "border-foreground/40 bg-muted/20 ring-1 ring-foreground/20"
                : "border-border/80"
            )}
            aria-pressed={isSelected}
            aria-label={`Filter by ${card.label}`}
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

export default EmployeeStatsCards;
