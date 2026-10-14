"use client";

import { useSyncExternalStore } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCw,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Format user role for display
 * @param {string} userRole - Raw role string
 * @returns {string} Formatted label
 */
function formatRole(userRole) {
  if (!userRole) return "Admin";
  const map = {
    superadmin: "Super Admin",
    hr: "HR Admin",
    security: "Security Guard",
    admin: "Administrator",
  };
  return map[userRole] || userRole.toUpperCase();
}

/**
 * Client and server snapshot resolvers for greeting
 */
function getClientGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getServerGreeting() {
  return "Welcome";
}

/**
 * Client and server snapshot resolvers for date display
 */
function getClientDate() {
  return dayjs().format("dddd, MMMM D, YYYY");
}

function getServerDate() {
  return "";
}

const emptySubscribe = () => () => {};

export default function CommandHeader({
  session,
  isPolling,
  countdown,
  onTogglePolling,
  onRefresh,
  isLoading,
  lastUpdated,
  systemStatus = "online",
}) {
  const userName = session?.user?.name?.split(" ")[0] || "Administrator";
  const userRole = formatRole(session?.user?.role);

  const greeting = useSyncExternalStore(
    emptySubscribe,
    getClientGreeting,
    getServerGreeting
  );

  const currentDate = useSyncExternalStore(
    emptySubscribe,
    getClientDate,
    getServerDate
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-border/80 bg-card/60 p-4 sm:p-5 backdrop-blur-md shadow-sm"
    >
      {/* Left: User greeting & role badge */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              suppressHydrationWarning
              className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
            >
              {greeting}, {userName}
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs py-0.5 px-2">
              {userRole}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            {currentDate ? (
              <span suppressHydrationWarning>{currentDate}</span>
            ) : (
              <span className="inline-block h-3.5 w-36 rounded bg-muted/60 animate-pulse" />
            )}
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  systemStatus === "online"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              {systemStatus === "online" ? "System Live" : "Scanner Idle"}
            </span>
            {lastUpdated && (
              <>
                <span>•</span>
                <span className="hidden sm:inline">
                  Updated {dayjs(lastUpdated).format("h:mm:ss A")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Operational Controls & Kiosk Link */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-start md:justify-end">
        {/* Polling status & countdown pill */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-muted/50 px-2.5 py-1 text-xs font-mono text-muted-foreground">
          <Radio
            className={`h-3.5 w-3.5 ${
              isPolling ? "text-emerald-500 animate-pulse" : "text-muted-foreground"
            }`}
          />
          <span className="min-w-[70px] text-center">
            {isPolling ? `Sync ${countdown}s` : "Paused"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md hover:bg-background/80"
            onClick={onTogglePolling}
            title={isPolling ? "Pause auto-sync" : "Resume auto-sync"}
            aria-label={isPolling ? "Pause auto-sync" : "Resume auto-sync"}
          >
            {isPolling ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3 text-emerald-600" />
            )}
          </Button>
        </div>

        {/* Manual Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </motion.header>
  );
}
