"use client";

import React, { memo } from "react";
import Link from "next/link";
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
  User,
  ShieldCheck,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

/**
 * LeaderTable Component
 * Read-only directory of personnel holding leadership positions with team headcounts and shortcut to team roster.
 */
const LeaderTable = memo(function LeaderTable({
  leaders = [],
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  loading = false,
}) {
  const { page, limit, total, totalPages } = pagination;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border/80 overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-border/80 hover:bg-transparent">
              <TableHead className="w-14 text-center font-mono text-[11px] text-muted-foreground">
                #
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Leader Name
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Position Title
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Department
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Direct Reports
              </TableHead>
              <TableHead className="text-right text-xs font-semibold text-foreground pr-4">
                Directory Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaders.map((leader, index) => {
              const rowNumber = (page - 1) * limit + index + 1;

              return (
                <TableRow
                  key={leader.id}
                  className="border-border/80 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="text-center font-mono text-xs text-muted-foreground/80 py-3">
                    {rowNumber}
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
                        <User className="size-3.5" />
                      </div>
                      <div>
                        <span className="font-medium text-xs text-foreground tracking-tight block">
                          {leader.name}
                        </span>
                        {leader.ashima_id && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {leader.ashima_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                      <ShieldCheck className="size-3 text-purple-600 dark:text-purple-400" />
                      {leader.position_name || "Leader"}
                    </span>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5 text-xs text-foreground">
                      <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                      <span>{leader.department_name || "Unassigned"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 border border-border/70 text-foreground">
                      <Users className="size-3 text-muted-foreground" />
                      <span className="font-mono">{leader.team_count || 0}</span>
                      <span className="text-muted-foreground">direct reports</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right py-3 pr-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] px-2.5 border-border/80 gap-1 hover:bg-muted"
                      render={
                        <Link
                          href={`/admin/employees-management?leader=${encodeURIComponent(
                            leader.id
                          )}`}
                        />
                      }
                    >
                      <span>View Team</span>
                      <ArrowUpRight className="size-3 text-muted-foreground" />
                    </Button>
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
          <span className="font-medium text-foreground">{total}</span> leaders
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
  );
});

export default LeaderTable;
