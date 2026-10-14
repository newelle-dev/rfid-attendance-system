"use client";

import React, { memo } from "react";
import { 
  Lock, 
  Check, 
  X, 
  CheckCheck, 
  ShieldCheck, 
  ExternalLink 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isProtectedPermission, isCellModified } from "./utils";
import { cn } from "@/lib/utils";

/**
 * PermissionsMatrixGrid Component
 * Tier 4 View A: True 2D Grid with sticky module column, role headers with bulk controls,
 * and staged modification indicators.
 */
const PermissionsMatrixGrid = memo(function PermissionsMatrixGrid({
  modules = [],
  roles = [],
  permissions = [],
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
    <TooltipProvider delay={150}>
      <div className="relative rounded-lg border border-border/80 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border/80 bg-muted/40">
                {/* Sticky Left Column: Module Description */}
                <th className="sticky left-0 z-20 bg-card/95 backdrop-blur-xs px-4 py-3.5 text-xs font-semibold text-foreground uppercase tracking-wider w-[280px] sm:w-[320px] border-r border-border/60">
                  <div className="flex items-center justify-between">
                    <span>System Module & Scope</span>
                    <span className="text-[10px] font-mono text-muted-foreground font-normal">
                      {modules.length} Modules
                    </span>
                  </div>
                </th>

                {/* Role Columns */}
                {roles.map((role) => {
                  const RoleIcon = role.icon;
                  const isSuperadmin = role.value === "superadmin";

                  return (
                    <th
                      key={role.value}
                      className="px-4 py-3 text-center align-top min-w-[140px] border-r border-border/40 last:border-r-0"
                    >
                      <div className="flex flex-col items-center justify-between gap-1.5 min-h-[64px]">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("size-2 rounded-full", role.dotColor)} />
                          <span className="text-xs font-semibold text-foreground">
                            {role.label}
                          </span>
                        </div>

                        {/* Quick Role Actions */}
                        {!isSuperadmin ? (
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onSetRoleAll(role.value, true)}
                              className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-emerald-600 gap-1"
                              title={`Grant all modules for ${role.label}`}
                            >
                              <CheckCheck className="size-3" />
                              <span>All</span>
                            </Button>
                            <span className="text-border text-xs">/</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onSetRoleAll(role.value, false)}
                              className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-rose-600 gap-1"
                              title={`Revoke all modules for ${role.label}`}
                            >
                              <X className="size-3" />
                              <span>None</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            Full Access
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/60">
              {modules.map((module) => {
                const ModuleIcon = module.icon;

                return (
                  <tr
                    key={module.value}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* Sticky Left Column: Module Details */}
                    <td className="sticky left-0 z-10 bg-card/95 backdrop-blur-xs px-4 py-3.5 border-r border-border/60">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-muted/60 text-muted-foreground shrink-0 mt-0.5 border border-border/40">
                          <ModuleIcon className="size-4 text-foreground/80" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-xs sm:text-sm tracking-tight truncate">
                              {module.label}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0 font-normal shrink-0 border-border/70",
                                module.category === "Admin"
                                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-400"
                                  : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                              )}
                            >
                              {module.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Cells */}
                    {roles.map((role) => {
                      const cellPerm = getCellPermission(role.value, module.value);
                      const hasAccess = Boolean(cellPerm?.permission?.access);
                      const isProtected = isProtectedPermission(role.value, module.value);
                      const isModified = isCellModified(modifiedList, role.value, module.value);

                      return (
                        <td
                          key={`${role.value}-${module.value}`}
                          className={cn(
                            "px-4 py-3.5 text-center align-middle border-r border-border/40 last:border-r-0 transition-colors",
                            isModified && "bg-amber-500/5 dark:bg-amber-500/10"
                          )}
                        >
                          <div className="flex flex-col items-center justify-center gap-1.5">
                            {isProtected ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted/60 text-muted-foreground border border-border/80 cursor-not-allowed">
                                    <Lock className="size-3 text-rose-500 shrink-0" />
                                    <span className="text-xs font-semibold text-foreground">
                                      Locked
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Root Security Invariant: Superadmin access to Role Permissions cannot be revoked.
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <Switch
                                  checked={hasAccess}
                                  onCheckedChange={(checked) =>
                                    onToggle(role.value, module.value, checked)
                                  }
                                  aria-label={`Toggle ${module.label} access for ${role.label}`}
                                />
                              </div>
                            )}

                            {/* Staged Modification Pill */}
                            {isModified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-medium">
                                <span className="size-1 rounded-full bg-amber-500 animate-pulse" />
                                Staged
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
});

export default PermissionsMatrixGrid;
