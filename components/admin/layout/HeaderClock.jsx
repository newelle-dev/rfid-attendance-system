"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { formatDate, formatTime } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

/**
 * HeaderClock Component
 * 
 * Displays the live attendance server time and current date in a modern
 * pill-shaped badge with subtle border and pulsing live indicator.
 * 
 * @param {Object} props
 * @param {'desktop' | 'mobile'} [props.variant='desktop']
 * @param {string} [props.className]
 */
export default function HeaderClock({ variant = "desktop", className }) {
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    // Set initial date on mount to prevent SSR hydration mismatch
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!currentTime) {
    return (
      <div className={cn("h-8 w-36 rounded-full bg-muted/60 animate-pulse", className)} />
    );
  }

  if (variant === "mobile") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/60 text-xs font-medium text-foreground", className)}>
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span className="font-mono font-semibold tabular-nums tracking-tight">
          {formatTime(currentTime)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs shadow-2xs backdrop-blur-xs select-none",
        className
      )}
    >
      {/* Live status dot */}
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>

      {/* Live Clock with monospaced tabular numbers */}
      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums text-foreground tracking-tight">
        <Clock className="size-3.5 text-muted-foreground" />
        <span>{formatTime(currentTime)}</span>
      </div>

      <div className="h-3 w-px bg-border/80" />

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Calendar className="size-3.5 text-muted-foreground/80" />
        <span className="hidden sm:inline">{formatDate(currentTime)}</span>
        <span className="sm:hidden">
          {currentTime.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}
