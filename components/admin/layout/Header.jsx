"use client";

import * as React from "react";
import Link from "next/link";
import { MonitorPlay, ExternalLink } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import CommandMenu from "./CommandMenu";
import { cn } from "@/lib/utils";

export default function Header({ className }) {
  return (
    <header
      data-slot="admin-header"
      className={cn(
        "sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/95 px-4 backdrop-blur-md transition-all duration-200 ease-linear md:px-6",
        className
      )}
    >
      {/* Left Section: Sidebar Trigger */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
      </div>

      {/* Right Section: Action Bar (Command Menu, Kiosk Link) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Spotlight Command Search */}
        <CommandMenu />

        <Separator orientation="vertical" className="h-4 bg-border/80 hidden sm:block" />

        {/* Jump to Kiosk Mode Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden sm:inline-flex h-8 gap-1.5 rounded-lg border-border/80 bg-background px-2.5 text-xs font-medium text-foreground shadow-2xs hover:bg-muted"
          )}
        >
          <MonitorPlay className="size-3.5 text-blue-600 dark:text-blue-400" />
          <span>Kiosk Terminal</span>
          <ExternalLink className="size-3 text-muted-foreground ml-0.5" />
        </Link>
      </div>
    </header>
  );
}