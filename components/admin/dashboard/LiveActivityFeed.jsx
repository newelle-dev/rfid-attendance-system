"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogIn, 
  LogOut, 
  Coffee, 
  Play, 
  ArrowRight, 
  Activity, 
  SearchX,
  CreditCard
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Initialize relativeTime plugin
dayjs.extend(relativeTime);

/**
 * Configure badge styling and icon based on log type
 */
function getLogTypeConfig(logType) {
  switch (logType) {
    case "time_in":
      return {
        label: "TIME IN",
        icon: LogIn,
        badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
        avatarBorder: "ring-emerald-500/40",
      };
    case "time_out":
      return {
        label: "TIME OUT",
        icon: LogOut,
        badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
        avatarBorder: "ring-rose-500/40",
      };
    case "break_in":
      return {
        label: "BREAK IN",
        icon: Coffee,
        badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
        avatarBorder: "ring-amber-500/40",
      };
    case "break_out":
      return {
        label: "BREAK OUT",
        icon: Play,
        badgeClass: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
        avatarBorder: "ring-sky-500/40",
      };
    default:
      return {
        label: "SCAN",
        icon: Activity,
        badgeClass: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30",
        avatarBorder: "ring-slate-500/40",
      };
  }
}

/**
 * Generate 2-letter initials from full name
 */
function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LiveActivityFeed({ logs = [], isLoading = false }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    if (activeFilter === "all") return logs;
    if (activeFilter === "in") return logs.filter((l) => l.logType === "time_in");
    if (activeFilter === "out") return logs.filter((l) => l.logType === "time_out");
    if (activeFilter === "break") return logs.filter((l) => l.logType === "break_in" || l.logType === "break_out");
    return logs;
  }, [logs, activeFilter]);

  const filterButtons = [
    { id: "all", label: "All Activity" },
    { id: "in", label: "Time In" },
    { id: "out", label: "Time Out" },
    { id: "break", label: "Breaks" },
  ];

  return (
    <Card className="border border-border/80 bg-card/60 shadow-sm flex flex-col h-full">
      {/* Header with Title and Filter Pills */}
      <CardHeader className="p-5 pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Live RFID Scan Activity
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Real-time stream of incoming kiosk punches
              </p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1 overflow-x-auto">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setActiveFilter(btn.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
                  activeFilter === btn.id
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* Feed list body */}
      <CardContent className="p-0 flex-1 divide-y divide-border/60 overflow-hidden">
        {isLoading && logs.length === 0 ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-6 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
              <SearchX className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No recent punches</p>
            <p className="text-xs text-muted-foreground max-w-xs mt-1">
              {activeFilter === "all"
                ? "No RFID scans recorded yet for today."
                : `No recent logs matching filter "${activeFilter}".`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-[520px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filteredLogs.map((log) => {
                const config = getLogTypeConfig(log.logType);
                const Icon = config.icon;
                const formattedTime = log.timestamp
                  ? dayjs(log.timestamp).format("h:mm:ss A")
                  : "N/A";
                const timeAgo = log.timestamp
                  ? dayjs(log.timestamp).fromNow()
                  : "";

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors group"
                  >
                    {/* Employee Profile Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Initials Avatar */}
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-xs tracking-wider text-secondary-foreground ring-2",
                          config.avatarBorder
                        )}
                      >
                        {getInitials(log.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/attendance-logs?search=${encodeURIComponent(log.ashimaId || "")}`}
                            className="text-sm font-medium text-foreground truncate hover:underline hover:text-primary transition-colors"
                            title={log.name}
                          >
                            {log.name}
                          </Link>
                          <span className="text-[11px] font-mono text-muted-foreground shrink-0 hidden sm:inline">
                            {log.ashimaId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <span className="truncate">{log.department}</span>
                          <span>•</span>
                          <span className="shrink-0 font-medium text-foreground/80">{formattedTime}</span>
                          <span className="hidden md:inline text-muted-foreground/70">({timeAgo})</span>
                        </div>
                      </div>
                    </div>

                    {/* Punch Badge & Terminal ID */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="flex items-center justify-end gap-1 text-[11px] font-mono text-muted-foreground/80">
                          <CreditCard className="h-3 w-3" />
                          {log.deviceId}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-semibold text-[11px] px-2.5 py-1 flex items-center gap-1 border shrink-0",
                          config.badgeClass
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{config.label}</span>
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>

      {/* Footer with Link to Full Attendance Logs */}
      <div className="p-3 sm:px-5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Showing latest {filteredLogs.length} scans
        </span>
        <Link
          href="/admin/attendance-logs"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1 text-xs font-medium h-7 hover:text-primary"
          )}
        >
          <span>View All Logs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
