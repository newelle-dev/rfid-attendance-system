"use client";

import React, { useState, useMemo, memo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  CalendarClock,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * EmployeeTable Component
 * High-density minimalist table with clickable rows, quick actions dropdown, and custom pagination.
 */
const EmployeeTable = memo(function EmployeeTable({
  employees = [],
  totalEmployees = 0,
  pagination = { pageIndex: 0, pageSize: 10 },
  setPagination,
  onView,
  onEdit,
  onDelete,
  loading = false,
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyRfid = async (e, rfid) => {
    e.stopPropagation();
    if (!rfid) return;
    try {
      await navigator.clipboard.writeText(rfid);
      setCopiedId(rfid);
      toast.success("RFID tag copied to clipboard");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Failed to copy RFID tag");
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "avatar",
        header: "",
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <Avatar className="size-8 rounded-md border border-border shrink-0">
              {emp.photo ? (
                <AvatarImage src={emp.photo} alt={emp.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="rounded-md text-xs font-medium bg-muted">
                {emp.name?.charAt(0)?.toUpperCase() || "E"}
              </AvatarFallback>
            </Avatar>
          );
        },
      },
      {
        accessorKey: "ashima_id",
        header: "Employee ID",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-medium text-foreground">
            {getValue() || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Employee",
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {emp.name}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {emp.position || "No position"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {getValue() || "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "leader_name",
        header: "Reporting To",
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {getValue() || "Direct"}
          </span>
        ),
      },
      {
        accessorKey: "rfid_tag",
        header: "RFID Tag",
        cell: ({ getValue }) => {
          const rfid = getValue();
          const isCopied = copiedId === rfid;
          if (!rfid) {
            return (
              <span className="text-[11px] text-muted-foreground/60 italic">
                Unassigned
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-medium text-foreground px-1.5 py-0.5 rounded bg-muted/60 border border-border/80">
                {rfid}
              </span>
              <button
                type="button"
                onClick={(e) => handleCopyRfid(e, rfid)}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                title="Copy RFID"
              >
                {isCopied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() || "active";
          const dotColor =
            status === "active"
              ? "bg-emerald-500"
              : status === "inactive"
              ? "bg-amber-500"
              : "bg-zinc-400";

          return (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border bg-background text-[11px] font-medium capitalize">
              <span className={cn("size-1.5 rounded-full", dotColor)} />
              {status}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      aria-label="Open employee actions menu"
                    />
                  }
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-xs">
                  <DropdownMenuItem
                    onClick={() => onView?.(emp)}
                    className="cursor-pointer gap-2"
                  >
                    <Eye className="size-3.5" />
                    View Dossier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit?.(emp)}
                    className="cursor-pointer gap-2"
                  >
                    <Edit className="size-3.5" />
                    Edit Details
                  </DropdownMenuItem>
                  {emp.rfid_tag && (
                    <DropdownMenuItem
                      onClick={(e) => handleCopyRfid(e, emp.rfid_tag)}
                      className="cursor-pointer gap-2"
                    >
                      <Copy className="size-3.5" />
                      Copy RFID UID
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    render={
                      <Link
                        href={`/admin/attendance-logs?search=${encodeURIComponent(
                          emp.ashima_id || emp.name
                        )}`}
                        className="flex items-center gap-2 cursor-pointer w-full"
                      />
                    }
                  >
                    <CalendarClock className="size-3.5" />
                    Attendance Logs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(emp)}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                    Delete Employee
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [copiedId, onView, onEdit, onDelete]
  );

  const table = useReactTable({
    data: employees,
    columns,
    state: {
      pagination,
    },
    manualPagination: true,
    pageCount: Math.ceil(totalEmployees / (pagination.pageSize || 10)) || 1,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = table.getPageCount();
  const currentPage = pagination.pageIndex;
  const startRow = totalEmployees === 0 ? 0 : currentPage * pagination.pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pagination.pageSize, totalEmployees);

  return (
    <div className="space-y-3">
      {/* Table Container */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-semibold text-muted-foreground h-9 px-3 first:w-10 first:pl-3 last:w-12"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onView?.(row.original)}
                className="cursor-pointer border-border hover:bg-muted/30 transition-colors group"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onView?.(row.original);
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-2.5 px-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-foreground">{startRow}</strong> to{" "}
            <strong className="text-foreground">{endRow}</strong> of{" "}
            <strong className="text-foreground">{totalEmployees}</strong> employees
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

        {/* Page Nav */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || loading}
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
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || loading}
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

export default EmployeeTable;