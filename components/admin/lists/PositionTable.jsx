"use client";

import React, { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  ShieldCheck,
  Users,
  Edit2,
  Trash2,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * PositionTable Component
 * Renders job positions with leadership role badges, assigned staff counts, and deletion safeguards.
 */
const PositionTable = memo(function PositionTable({
  positions = [],
  onEdit,
  onDelete,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  loading = false,
}) {
  const { page, limit, total, totalPages } = pagination;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="rounded-md border border-border/80 overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead className="w-14 text-center font-mono text-[11px] text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Position Title
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Role Classification
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Assigned Staff
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Removal Safeguard
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-foreground pr-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos, index) => {
                const rowNumber = (page - 1) * limit + index + 1;
                const hasAssigned = (pos.employee_count || 0) > 0;

                return (
                  <TableRow
                    key={pos.id}
                    className="border-border/80 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-center font-mono text-xs text-muted-foreground/80 py-3">
                      {rowNumber}
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-muted/60 border border-border/60 text-muted-foreground">
                          <Briefcase className="size-4" />
                        </div>
                        <span className="font-medium text-xs text-foreground tracking-tight">
                          {pos.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      {pos.is_leader ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                          <ShieldCheck className="size-3 text-purple-600 dark:text-purple-400" />
                          Leadership Role
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/70">
                          Standard Role
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 border border-border/70 text-foreground">
                        <Users className="size-3 text-muted-foreground" />
                        <span className="font-mono">{pos.active_employee_count || 0}</span>
                        <span className="text-muted-foreground">
                          active / {pos.employee_count || 0} total
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      {hasAssigned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <Lock className="size-3" />
                          In Use ({pos.employee_count})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          Available to Remove
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEdit && onEdit(pos)}
                          className="size-7 text-muted-foreground hover:text-foreground"
                          title="Edit position"
                          aria-label={`Edit ${pos.name}`}
                        >
                          <Edit2 className="size-3.5" />
                        </Button>

                        {hasAssigned ? (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="inline-block cursor-not-allowed">
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    disabled
                                    className="size-7 opacity-40 text-muted-foreground pointer-events-none"
                                    aria-label="Cannot delete position with assigned employees"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </span>
                              }
                            />
                            <TooltipContent side="left" className="text-xs max-w-xs">
                              <div className="flex items-center gap-1.5 font-medium">
                                <ShieldAlert className="size-3.5 text-amber-400" />
                                Protected from deletion
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {pos.employee_count} employee(s) are assigned to this position. Reassign them first.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onDelete && onDelete(pos)}
                            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete position"
                            aria-label={`Delete ${pos.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Standardized Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground px-1">
          <div className="font-mono text-[11px]">
            Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
            <span className="font-medium text-foreground">{endItem}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> positions
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
              className="h-7 px-2.5 text-xs border-border/80 gap-1"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>

            <span className="px-2 text-[11px] font-medium text-foreground font-mono">
              Page {page} of {Math.max(totalPages, 1)}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
              className="h-7 px-2.5 text-xs border-border/80 gap-1"
              aria-label="Next page"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});

export default PositionTable;
