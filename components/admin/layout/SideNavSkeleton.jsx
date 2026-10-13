"use client";

import { cn } from "@/lib/utils";

export default function SideNavSkeleton({ collapsed = false }) {
  return (
    <div 
      className={cn(
        "bg-sidebar text-sidebar-foreground h-screen sticky top-0 left-0 z-20 flex flex-col border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-14" : "w-64"
      )}
    >
      {/* Header skeleton */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-3">
        {collapsed ? (
          <div className="size-8 rounded-lg bg-muted animate-pulse" />
        ) : (
          <div className="h-9 w-3/4 rounded-lg bg-muted animate-pulse" />
        )}
      </div>
      
      {/* Navigation skeleton */}
      <div className="flex-1 p-2 space-y-1.5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className={cn(
              "flex items-center h-10 rounded-lg bg-muted/60 animate-pulse",
              collapsed ? "justify-center px-2" : "px-3 gap-3"
            )}
          >
            <div className="size-4.5 rounded bg-muted-foreground/20" />
            {!collapsed && (
              <div className="h-4 flex-1 rounded bg-muted-foreground/20" />
            )}
          </div>
        ))}
      </div>
      
      {/* Footer skeleton */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center rounded-lg bg-muted/60 p-2 animate-pulse",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className="size-8 rounded-lg bg-muted-foreground/20" />
          {!collapsed && (
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 rounded bg-muted-foreground/20" />
              <div className="h-2.5 w-1/2 rounded bg-muted-foreground/20" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}