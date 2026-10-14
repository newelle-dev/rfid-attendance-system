"use client";

import React, { memo } from "react";
import { Users, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AccountStatsCards Component
 * Tier 3 Interactive KPI Metric Strip for privileged account hierarchy.
 */
const AccountStatsCards = memo(function AccountStatsCards({
  stats = {
    total: 0,
    superadmin: 0,
    admin: 0,
    security: 0,
    hr: 0,
    recentAccounts: 0,
  },
  loading = false,
  roleFilter = "all",
  onKpiClick,
}) {
  const adminTierCount = (stats.superadmin || 0) + (stats.admin || 0);

  const cards = [
    {
      id: "total",
      label: "Total Accounts",
      value: stats.total,
      subtext: "All system credentials",
      icon: Users,
      indicatorDot: "bg-blue-500",
      isActive: roleFilter === "all",
    },
    {
      id: "admin_tier",
      label: "Executive Tier",
      value: adminTierCount,
      subtext: `${stats.superadmin || 0} Super Admin, ${stats.admin || 0} Admin`,
      icon: ShieldAlert,
      indicatorDot: "bg-purple-500",
      isActive: roleFilter === "admin" || roleFilter === "superadmin",
    },
    {
      id: "security",
      label: "Security Staff",
      value: stats.security,
      subtext: "Kiosk & gate operators",
      icon: ShieldCheck,
      indicatorDot: "bg-emerald-500",
      isActive: roleFilter === "security",
    },
    {
      id: "hr",
      label: "HR Personnel",
      value: stats.hr,
      subtext: "Personnel & roster leads",
      icon: UserCheck,
      indicatorDot: "bg-amber-500",
      isActive: roleFilter === "hr",
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

            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-muted animate-pulse rounded" />
                ) : (
                  Number(card.value || 0).toLocaleString()
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
});

export default AccountStatsCards;
