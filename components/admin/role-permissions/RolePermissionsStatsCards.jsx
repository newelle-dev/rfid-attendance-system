"use client";

import React, { memo } from "react";
import { ROLES, MODULES } from "./constants";
import { calculateRoleStats } from "./utils";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

/**
 * RolePermissionsStatsCards Component
 * Tier 3 Interactive KPI Metric Strip displaying access coverage, active accounts,
 * and progress bars for Superadmin, Admin, Security, and HR roles.
 */
const RolePermissionsStatsCards = memo(function RolePermissionsStatsCards({
  permissions = [],
  accountStats = {},
  loading = false,
  activeRoleFilter = null,
  onKpiClick
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {ROLES.map((role) => {
        const stats = calculateRoleStats(permissions, role.value);
        const accountCount = Number(accountStats[role.value] || 0);
        const isActive = activeRoleFilter === role.value;
        const Icon = role.icon;

        return (
          <button
            key={role.value}
            type="button"
            onClick={() => onKpiClick && onKpiClick(role.value)}
            className={cn(
              "group relative flex flex-col justify-between p-4 rounded-lg border text-left transition-all duration-150 outline-none select-none",
              "bg-card hover:bg-muted/40",
              isActive
                ? "border-foreground/50 bg-muted/20 ring-1 ring-foreground/20 shadow-xs"
                : "border-border/80"
            )}
            aria-pressed={isActive}
            aria-label={`Filter by ${role.label} role`}
          >
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={cn("size-2 rounded-full shrink-0", role.dotColor)}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-foreground tracking-tight truncate">
                  {role.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isActive && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-foreground text-background font-semibold">
                    Focused
                  </span>
                )}
                <Icon
                  className="size-3.5 text-muted-foreground/70 group-hover:text-foreground transition-colors"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                  {loading ? (
                    <span className="inline-block w-12 h-6 bg-muted animate-pulse rounded" />
                  ) : (
                    `${stats.accessPercentage}%`
                  )}
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {stats.accessibleModules}/{MODULES.length} modules
                </span>
              </div>

              {/* Access Progress Bar */}
              <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-300", role.dotColor)}
                  style={{ width: `${stats.accessPercentage}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground truncate pt-0.5">
                {accountCount.toLocaleString()} {accountCount === 1 ? "active user" : "active users"} assigned
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
});

export default RolePermissionsStatsCards;
