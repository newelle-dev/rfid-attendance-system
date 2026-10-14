"use client";

import React, { memo, useState } from "react";
import dayjs from "dayjs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LogOut,
  Clock,
  CreditCard,
  Building2,
  Briefcase,
  Copy,
  Check,
  Calendar,
  ShieldCheck,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

/**
 * AttendanceDetailSheet Component
 * Slide-over drawer providing a comprehensive punch verification breakdown,
 * session timeline, shift duration metrics, and RFID hardware audit metadata.
 */
const AttendanceDetailSheet = memo(function AttendanceDetailSheet({
  open = false,
  onOpenChange,
  log = null,
}) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const inDay = log.in_time ? dayjs(log.in_time) : null;
  const outDay = log.out_time ? dayjs(log.out_time) : null;
  const isOnPremise = !log.out_time;

  const handleCopyRfid = async () => {
    if (!log.rfid_tag) {
      toast.info("No RFID tag recorded for this log entry");
      return;
    }
    try {
      await navigator.clipboard.writeText(log.rfid_tag);
      setCopied(true);
      toast.success("RFID tag copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy RFID tag");
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

  const getShiftDuration = () => {
    if (!inDay) return "N/A";
    const end = outDay || dayjs();
    const diffMins = Math.max(0, end.diff(inDay, "minute"));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto space-y-6">
        {/* Header */}
        <SheetHeader className="pb-3 border-b border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <SheetTitle className="text-base font-semibold">
                Punch Session Verification
              </SheetTitle>
            </div>
            {isOnPremise ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs gap-1.5"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                On-Premise
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs gap-1 border-border/70">
                <Check className="size-3 text-blue-500" />
                Completed Shift
              </Badge>
            )}
          </div>
          <SheetDescription className="text-xs">
            Log ID #{log.id} · Recorded via RFID Terminal Kiosk
          </SheetDescription>
        </SheetHeader>

        {/* Employee Summary Card */}
        <div className="p-4 rounded-lg border border-border/80 bg-muted/20 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 border border-border rounded-full shrink-0">
              <AvatarImage
                src={log.photo || undefined}
                alt={log.name || "Employee"}
                className="object-cover"
              />
              <AvatarFallback className="text-sm font-semibold bg-muted">
                {getInitials(log.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {log.name || "Unknown Personnel"}
              </h3>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                ASHIMA: {log.ashima_id || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground truncate">
              <Building2 className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{log.department || "No Department"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground truncate">
              <Briefcase className="size-3.5 shrink-0 text-muted-foreground/70" />
              <span className="truncate">{log.position || "General Staff"}</span>
            </div>
          </div>
        </div>

        {/* Punch Session Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Session Timeline
          </h4>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {/* Clock In */}
            <div className="relative space-y-1">
              <div className="absolute -left-6 top-0.5 size-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <LogIn className="size-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  Clocked In
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {inDay ? inDay.format("hh:mm:ss A") : "N/A"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {inDay ? inDay.format("MMMM D, YYYY · dddd") : "No timestamp recorded"}
              </p>
            </div>

            {/* Elapsed / Shift Duration Indicator */}
            <div className="relative space-y-1">
              <div className="absolute -left-6 top-0.5 size-5 rounded-full bg-muted border border-border flex items-center justify-center">
                <Clock className="size-3 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  Total Shift Duration
                </span>
                <span className="text-xs font-mono font-semibold text-foreground">
                  {getShiftDuration()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isOnPremise
                  ? "Active session elapsed since terminal swipe"
                  : "Completed punch interval"}
              </p>
            </div>

            {/* Clock Out */}
            <div className="relative space-y-1">
              <div
                className={`absolute -left-6 top-0.5 size-5 rounded-full border flex items-center justify-center ${
                  isOnPremise
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                }`}
              >
                <LogOut className="size-3" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  Clocked Out
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${
                    isOnPremise
                      ? "text-amber-500"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {outDay ? outDay.format("hh:mm:ss A") : "Still On-Premise"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {outDay
                  ? outDay.format("MMMM D, YYYY · dddd")
                  : "Awaiting out swipe at RFID terminal"}
              </p>
            </div>
          </div>
        </div>

        {/* Technical & Hardware Audit Metadata */}
        <div className="space-y-3 pt-2 border-t border-border/80">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hardware Audit & Metadata
          </h4>

          <div className="rounded-md border border-border/70 p-3 space-y-2.5 bg-card text-xs">
            {/* RFID Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CreditCard className="size-3.5" />
                <span>RFID Tag</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-medium text-foreground">
                  {log.rfid_tag || "Not recorded"}
                </span>
                {log.rfid_tag && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-foreground"
                    onClick={handleCopyRfid}
                    title="Copy RFID Tag"
                  >
                    {copied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Log ID */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Hash className="size-3.5" />
                <span>Internal Log ID</span>
              </div>
              <span className="font-mono text-xs font-medium text-foreground">
                #{log.id}
              </span>
            </div>

            {/* Date Recorded */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>Calendar Date</span>
              </div>
              <span className="font-mono text-xs font-medium text-foreground">
                {inDay ? inDay.format("YYYY-MM-DD") : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange?.(false)}
            className="text-xs h-8 px-4"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
});

export default AttendanceDetailSheet;
