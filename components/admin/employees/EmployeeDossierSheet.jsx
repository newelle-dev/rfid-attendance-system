"use client";

import React, { memo } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CreditCard,
  Edit,
  ExternalLink,
  Copy,
  Trash2,
  Building2,
  Briefcase,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * EmployeeDossierSheet Component
 * Slide-over inspector presenting a rich read-only employee dossier with digital ID badge and quick shortcuts.
 */
const EmployeeDossierSheet = memo(function EmployeeDossierSheet({
  open = false,
  onOpenChange,
  employee = null,
  onEdit,
  onDelete,
}) {
  const [copied, setCopied] = React.useState(false);

  if (!employee) return null;

  const handleCopyRfid = async (e) => {
    e?.stopPropagation();
    if (!employee.rfid_tag) {
      toast.info("No RFID tag assigned to this employee");
      return;
    }
    try {
      await navigator.clipboard.writeText(employee.rfid_tag);
      setCopied(true);
      toast.success("RFID tag copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy RFID tag");
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500";
      case "inactive":
        return "bg-amber-500";
      case "resigned":
      default:
        return "bg-zinc-400";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-base font-semibold">
                Employee Dossier
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Card credentials & organizational record
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border bg-background text-[11px] font-medium capitalize">
              <span
                className={cn("size-1.5 rounded-full", getStatusDot(employee.status))}
              />
              {employee.status || "active"}
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Dossier Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Digital ID Badge Visual Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 mb-4">
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                  RFID Terminal Identity
                </p>
                <p className="text-xs font-semibold text-foreground">
                  Attendance System Credential
                </p>
              </div>
              <ShieldCheck className="size-4 text-muted-foreground/60" />
            </div>

            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-lg border border-border">
                {employee.photo ? (
                  <AvatarImage
                    src={employee.photo}
                    alt={employee.name}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg bg-muted text-base font-semibold">
                  {employee.name?.charAt(0)?.toUpperCase() || "E"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {employee.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {employee.position || "No position assigned"}
                </p>
                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-muted text-foreground border border-border">
                  ID: {employee.ashima_id || "N/A"}
                </div>
              </div>
            </div>

            {/* RFID Hardware Pill inside Badge */}
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CreditCard className="size-3.5" />
                <span className="text-[11px]">RFID UID:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-medium text-foreground">
                  {employee.rfid_tag || "Unassigned"}
                </span>
                {employee.rfid_tag && (
                  <button
                    type="button"
                    onClick={handleCopyRfid}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy RFID Tag"
                  >
                    {copied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Organizational Metadata */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Organizational Record
            </h4>

            <div className="grid grid-cols-1 gap-2.5 rounded-lg border border-border p-3.5 text-xs bg-muted/10">
              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="size-3.5" />
                  Department
                </span>
                <span className="font-medium text-foreground">
                  {employee.department || "Unassigned"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="size-3.5" />
                  Position
                </span>
                <span className="font-medium text-foreground">
                  {employee.position || "Unassigned"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/50">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-3.5" />
                  Reporting Line
                </span>
                <span className="font-medium text-foreground">
                  {employee.leader_name || "Direct / Independent"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CreditCard className="size-3.5" />
                  Employment Type
                </span>
                <span className="font-medium capitalize text-foreground">
                  {employee.emp_stat || "Regular"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shortcuts & Operations
            </h4>

            <Link
              href={`/admin/attendance-logs?search=${encodeURIComponent(employee.ashima_id || employee.name)}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors text-xs text-foreground group"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>View Attendance Logs for {employee.name}</span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(employee)}
            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2.5"
          >
            <Trash2 className="size-3.5 mr-1.5" />
            Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 px-3 border-border"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => onEdit?.(employee)}
              className="text-xs h-8 px-3 gap-1.5"
            >
              <Edit className="size-3.5" />
              Edit Employee
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
});

export default EmployeeDossierSheet;
