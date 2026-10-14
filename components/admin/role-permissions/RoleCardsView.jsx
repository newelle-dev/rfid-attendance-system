"use client";

import React, { memo } from "react";
import { 
  Lock, 
  Users, 
  CheckCheck, 
  X, 
  ShieldCheck 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { isProtectedPermission, isCellModified, calculateRoleStats } from "./utils";
import { cn } from "@/lib/utils";

/**
 * RoleCardsView Component
 * Tier 4 View B: Role Inspector Cards with dedicated module checklists, user rosters,
 * and bulk toggle presets.
 */
const RoleCardsView = memo(function RoleCardsView({
  modules = [],
  roles = [],
  permissions = [],
  accountStats = {},
  modifiedList = [],
  onToggle,
  onSetRoleAll,
}) {
  const getCellPermission = (roleValue, moduleValue) => {
    return permissions.find(
      (p) => p.role === roleValue && p.module === moduleValue
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => {
        const RoleIcon = role.icon;
        const stats = calculateRoleStats(permissions, role.value);
        const accountCount = Number(accountStats[role.value] || 0);
        const isSuperadmin = role.value === "superadmin";

        return (
          <Card
            key={role.value}
            className="border-border/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <CardHeader className="p-4 pb-3 border-b border-border/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-muted border border-border/60">
                      <RoleIcon className="size-4 text-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold text-foreground">
                          {role.label}
                        </CardTitle>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            role.badgeClass
                          )}
                        >
                          {stats.accessPercentage}% Access
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {accountCount.toLocaleString()} {accountCount === 1 ? "active account" : "active accounts"}
                      </p>
                    </div>
                  </div>

                  {/* Bulk Controls */}
                  {!isSuperadmin ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSetRoleAll(role.value, true)}
                        className="h-7 px-2 text-xs gap-1 border-border/80 hover:text-emerald-600"
                        title="Grant all modules"
                      >
                        <CheckCheck className="size-3" />
                        <span>All</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSetRoleAll(role.value, false)}
                        className="h-7 px-2 text-xs gap-1 border-border/80 hover:text-rose-600"
                        title="Revoke all modules"
                      >
                        <X className="size-3" />
                        <span>None</span>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-mono text-muted-foreground px-2 py-1 rounded bg-muted/50 border border-border/60">
                      Unrestricted
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {role.description}
                </p>
              </CardHeader>

              {/* Module Checklist */}
              <CardContent className="p-4 space-y-2.5">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Module Privileges ({stats.accessibleModules}/{modules.length})
                </div>

                <div className="divide-y divide-border/40 border border-border/60 rounded-md overflow-hidden bg-background">
                  {modules.map((module) => {
                    const ModuleIcon = module.icon;
                    const cellPerm = getCellPermission(role.value, module.value);
                    const hasAccess = Boolean(cellPerm?.permission?.access);
                    const isProtected = isProtectedPermission(role.value, module.value);
                    const isModified = isCellModified(modifiedList, role.value, module.value);

                    return (
                      <div
                        key={`${role.value}-${module.value}`}
                        className={cn(
                          "flex items-center justify-between p-3 transition-colors",
                          isModified ? "bg-amber-500/5 dark:bg-amber-500/10" : "hover:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-3">
                          <ModuleIcon className="size-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "text-xs font-medium truncate",
                                  hasAccess ? "text-foreground" : "text-muted-foreground"
                                )}
                              >
                                {module.label}
                              </span>
                              {isModified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-medium shrink-0">
                                  <span className="size-1 rounded-full bg-amber-500 animate-pulse" />
                                  Staged
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">
                              {module.description}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isProtected ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/80 text-xs">
                              <Lock className="size-3 text-rose-500" />
                              <span className="text-[11px]">Locked</span>
                            </div>
                          ) : (
                            <Switch
                              checked={hasAccess}
                              onCheckedChange={(checked) =>
                                onToggle(role.value, module.value, checked)
                              }
                              aria-label={`Toggle ${module.label} access for ${role.label}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </div>
          </Card>
        );
      })}
    </div>
  );
});

export default RoleCardsView;
