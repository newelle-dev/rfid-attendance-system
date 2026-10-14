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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  IdCard,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoleMeta, PAGE_SIZE_OPTIONS } from "@/constants/accountConstants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

/**
 * AccountTable Component
 * High-precision administrative account roster with identity avatars,
 * role authorization badges, login activity tracking, and removal safeguards.
 */
const AccountTable = memo(function AccountTable({
  accounts = [],
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  session,
  loading = false,
}) {
  const { page, limit, total, totalPages } = pagination;
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const currentUsername = session?.user?.username || "";
  const isSuperAdmin = session?.user?.role === "superadmin";

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Helper to extract initials
  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || "U").toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Responsive Table Container */}
        <div className="rounded-md border border-border/80 overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border/80 hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs font-semibold text-foreground">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground min-w-[200px]">
                  User Identity
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Ashima ID & Linkage
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Access Role
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Last Active
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Created
                </TableHead>
                <TableHead className="text-right text-xs font-semibold text-foreground pr-4 w-24">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account, index) => {
                const rowNumber = (page - 1) * limit + index + 1;
                const isSelf =
                  (currentUserId && Number(account.id) === currentUserId) ||
                  (currentUsername && account.username === currentUsername);
                const isTargetSuperAdmin = account.role === "superadmin";
                const roleMeta = getRoleMeta(account.role);

                // Permission safeguards
                const canEditThis = !isTargetSuperAdmin || isSuperAdmin;
                const canDeleteThis =
                  !isSelf && (!isTargetSuperAdmin || isSuperAdmin);

                return (
                  <TableRow
                    key={account.id}
                    className={cn(
                      "border-border/80 hover:bg-muted/30 transition-colors",
                      isSelf && "bg-muted/15"
                    )}
                  >
                    {/* Row Index */}
                    <TableCell className="text-center font-mono text-xs text-muted-foreground/80 py-3">
                      {rowNumber}
                    </TableCell>

                    {/* User Identity: Avatar, Name, Self Tag, Username */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-muted/80 border border-border/80 flex items-center justify-center font-semibold text-xs text-foreground shrink-0 select-none">
                          {getInitials(account.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-xs text-foreground tracking-tight truncate">
                              {account.name}
                            </span>
                            {isSelf && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                You
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[11px] text-muted-foreground truncate">
                            @{account.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Ashima ID & Linkage */}
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-muted/60 border border-border/70 text-foreground">
                          <IdCard className="size-3 text-muted-foreground" />
                          <span>{account.employeeId}</span>
                        </div>
                        {account.linkedEmployee && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                            {account.linkedEmployee.department} •{" "}
                            {account.linkedEmployee.position}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Access Role Badge */}
                    <TableCell className="py-3">
                      <Tooltip>
                        <TooltipTrigger render={
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border cursor-default",
                              roleMeta.badgeClass
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full shrink-0",
                                roleMeta.dotClass
                              )}
                              aria-hidden="true"
                            />
                            {roleMeta.name}
                          </span>
                        } />
                        <TooltipContent side="top">
                          <p className="text-xs">{roleMeta.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Last Active Timestamp */}
                    <TableCell className="py-3">
                      {account.lastLogin ? (
                        <Tooltip>
                          <TooltipTrigger render={
                            <div className="inline-flex items-center gap-1 text-xs text-foreground font-mono">
                              <Clock className="size-3 text-muted-foreground shrink-0" />
                              <span>{dayjs(account.lastLogin).fromNow()}</span>
                            </div>
                          } />
                          <TooltipContent side="top">
                            <p className="font-mono text-[11px]">
                              {dayjs(account.lastLogin).format("MMM DD, YYYY · hh:mm:ss A")}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Never logged in
                        </span>
                      )}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                      {account.createdAt
                        ? dayjs(account.createdAt).format("MMM DD, YYYY")
                        : "—"}
                    </TableCell>

                    {/* Row Actions */}
                    <TableCell className="text-right py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Button */}
                        {canEditThis ? (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onEdit && onEdit(account)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit account credentials"
                            aria-label={`Edit ${account.username}`}
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger render={
                              <span className="inline-block cursor-not-allowed">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  disabled
                                  className="size-7 opacity-40 text-muted-foreground pointer-events-none"
                                  aria-label="Super Admin accounts require Super Admin privileges"
                                >
                                  <Lock className="size-3.5" />
                                </Button>
                              </span>
                            } />
                            <TooltipContent side="left">
                              <p className="text-xs">
                                Super Admin accounts can only be edited by Super Admins.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Delete Button */}
                        {canDeleteThis ? (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onDelete && onDelete(account)}
                            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Delete account"
                            aria-label={`Delete ${account.username}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        ) : isSelf ? (
                          <Tooltip>
                            <TooltipTrigger render={
                              <span className="inline-block cursor-not-allowed">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  disabled
                                  className="size-7 opacity-40 text-muted-foreground pointer-events-none"
                                  aria-label="Cannot delete your own account"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </span>
                            } />
                            <TooltipContent side="left">
                              <p className="text-xs">
                                Security safeguard: You cannot delete your own account.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger render={
                              <span className="inline-block cursor-not-allowed">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  disabled
                                  className="size-7 opacity-40 text-muted-foreground pointer-events-none"
                                  aria-label="Cannot delete Super Admin account"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </span>
                            } />
                            <TooltipContent side="left">
                              <p className="text-xs">
                                Super Admin privileges required to remove this account.
                              </p>
                            </TooltipContent>
                          </Tooltip>
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
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px]">
              Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
              <span className="font-medium text-foreground">{endItem}</span> of{" "}
              <span className="font-medium text-foreground">{total}</span> accounts
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Rows:</span>
              <Select
                value={String(limit)}
                onValueChange={(val) => onLimitChange && onLimitChange(Number(val))}
              >
                <SelectTrigger className="h-7 w-16 text-[11px] border-border/80 bg-background font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem
                      key={size}
                      value={String(size)}
                      className="text-[11px] font-mono"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

export default AccountTable;