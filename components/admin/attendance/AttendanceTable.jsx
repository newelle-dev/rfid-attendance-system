"use client";

import React, { memo } from "react";
import dayjs from "dayjs";
import {
  LogIn,
  LogOut,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * AttendanceTable Component
 * Enterprise data table displaying attendance logs with compound employee info,
 * duration computation, status badges, and pagination controls.
 */
const AttendanceTable = memo(function AttendanceTable({
  logs = [],
  totalLogs = 0,
  pagination = { pageIndex: 0, pageSize: 25 },
  setPagination,
  onView,
  loading = false,
}) {
  const totalPages = Math.ceil(totalLogs / pagination.pageSize);
  const currentPage = pagination.pageIndex;

  const handlePageChange = (newPageIndex) => {
    if (newPageIndex >= 0 && newPageIndex < totalPages) {
      setPagination((prev) => ({ ...prev, pageIndex: newPageIndex }));
    }
  };

  const getInitials = (name) => {
    if (!name) return "EMP";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  };

  const formatDuration = (inTime, outTime) => {
    if (!inTime) return "N/A";
    const start = dayjs(inTime);

    if (outTime) {
      const end = dayjs(outTime);
      const diffMins = end.diff(start, "minute");
      if (diffMins < 0) return "—";
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }

    // Active shift
    const now = dayjs();
    const diffMins = Math.max(0, now.diff(start, "minute"));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `In Progress (${hours}h ${mins}m)`;
  };

  return (
    <div className="space-y-3">
      {/* Table Container */}
      <div className="rounded-lg border border-border/80 overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[280px] text-xs font-semibold">
                  Employee
                </TableHead>
                <TableHead className="w-[180px] text-xs font-semibold">
                  Department & Role
                </TableHead>
                <TableHead className="w-[150px] text-xs font-semibold">
                  Date
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold">
                  Time In
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold">
                  Time Out
                </TableHead>
                <TableHead className="w-[160px] text-xs font-semibold">
                  Shift Duration
                </TableHead>
                <TableHead className="w-[140px] text-xs font-semibold">
                  Status
                </TableHead>
                <TableHead className="w-[70px] text-right text-xs font-semibold">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const inDay = log.in_time ? dayjs(log.in_time) : null;
                const outDay = log.out_time ? dayjs(log.out_time) : null;
                const isOnPremise = !log.out_time;

                return (
                  <TableRow
                    key={log.id}
                    onClick={() => onView?.(log)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    {/* Compound Employee Cell */}
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 shrink-0 border border-border/70 rounded-full">
                          <AvatarImage
                            src={log.photo || undefined}
                            alt={log.name || "Employee"}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-[11px] font-medium bg-muted text-muted-foreground">
                            {getInitials(log.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {log.name || "Unknown Personnel"}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground tracking-tight">
                            {log.ashima_id || "No ASHIMA ID"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Department & Role */}
                    <TableCell className="py-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground font-medium truncate">
                          {log.department || "Unassigned"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {log.position || "General Staff"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="py-2.5 text-xs whitespace-nowrap">
                      {inDay ? (
                        <>
                          <span className="font-medium text-foreground">
                            {inDay.format("MMM D, YYYY")}
                          </span>
                          <span className="text-[11px] text-muted-foreground ml-1 font-normal">
                            ({inDay.format("ddd")})
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>

                    {/* Time In */}
                    <TableCell className="py-2.5 whitespace-nowrap">
                      {inDay ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-medium">
                          <LogIn className="size-3.5 shrink-0" />
                          <span>{inDay.format("hh:mm A")}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-mono text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Time Out */}
                    <TableCell className="py-2.5 whitespace-nowrap">
                      {outDay ? (
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-mono text-xs font-medium">
                          <LogOut className="size-3.5 shrink-0" />
                          <span>{outDay.format("hh:mm A")}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 font-mono text-xs pl-2">
                          —
                        </span>
                      )}
                    </TableCell>

                    {/* Shift Duration */}
                    <TableCell className="py-2.5 whitespace-nowrap">
                      {isOnPremise ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Clock className="size-3" />
                          <span>{formatDuration(log.in_time, log.out_time)}</span>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-foreground font-medium">
                          {formatDuration(log.in_time, log.out_time)}
                        </span>
                      )}
                    </TableCell>

                    {/* Status Pill */}
                    <TableCell className="py-2.5 whitespace-nowrap">
                      {isOnPremise ? (
                        <Badge
                          variant="outline"
                          className="h-6 gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-normal"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          On-Premise
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="h-6 gap-1 text-[11px] font-normal border-border/70"
                        >
                          <Check className="size-3 text-blue-500" />
                          Completed
                        </Badge>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell className="py-2.5 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView?.(log);
                        }}
                        className="size-7 text-muted-foreground hover:text-foreground"
                        aria-label={`View punch details for ${log.name}`}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-3">
          <span>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {totalLogs > 0 ? currentPage * pagination.pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min((currentPage + 1) * pagination.pageSize, totalLogs)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {totalLogs.toLocaleString()}
            </span>{" "}
            logs
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">Rows:</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(val) => {
                setPagination((prev) => ({
                  ...prev,
                  pageSize: Number(val),
                  pageIndex: 0,
                }));
              }}
              disabled={loading}
            >
              <SelectTrigger className="h-7 text-xs px-2 min-w-[65px] border-border/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
            className="h-7 px-2 border-border/80 text-xs"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5 mr-0.5" />
            Prev
          </Button>

          <span className="px-2 text-[11px] font-medium text-foreground">
            Page {currentPage + 1} of {Math.max(totalPages, 1)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || loading}
            className="h-7 px-2 border-border/80 text-xs"
            aria-label="Next page"
          >
            Next
            <ChevronRight className="size-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default AttendanceTable;