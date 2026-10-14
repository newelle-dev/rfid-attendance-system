"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { 
  Laptop, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Radio,
  Cpu,
  ShieldCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

export default function KioskStatusCard({ kioskStatus = {}, isLoading = false }) {
  const deviceId = kioskStatus.deviceId || "KIOSK-MAIN-01";
  const isOnline = kioskStatus.status === "online";
  const lastScanAt = kioskStatus.lastScanAt;
  const scansToday = kioskStatus.scansToday || 0;

  const lastSeenText = lastScanAt
    ? dayjs(lastScanAt).fromNow()
    : "No scans recorded today";

  const formattedLastSeen = lastScanAt
    ? dayjs(lastScanAt).format("h:mm:ss A")
    : null;

  return (
    <Card className="border border-border/80 bg-card/60 shadow-sm flex flex-col h-full">
      {/* Header matching LiveActivityFeed */}
      <CardHeader className="p-5 pb-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Laptop className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                Kiosk Terminal Health
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                RFID hardware card reader status
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={
              isOnline
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1.5"
            }
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            {isOnline ? "Active" : "Idle"}
          </Badge>
        </div>
      </CardHeader>

      {/* Main Content filling height */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Top metrics grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Terminal ID
            </span>
            <p className="font-mono font-bold text-foreground text-sm mt-1 truncate">
              {deviceId}
            </p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Default Main Reader
            </span>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Today&apos;s Scans
            </span>
            <p className="font-bold text-foreground text-sm mt-1">
              {isLoading ? (
                <span className="inline-block h-4 w-12 animate-pulse rounded bg-muted" />
              ) : (
                `${scansToday} scans`
              )}
            </p>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Punch transactions
            </span>
          </div>
        </div>

        {/* Telemetry and reader specs */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Reader Protocol</span>
            </span>
            <span className="font-medium text-foreground">13.56MHz RFID / NFC</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Input Mode</span>
            </span>
            <span className="font-medium text-foreground">HID Keyboard Emulation</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Last Heartbeat / Scan</span>
            </span>
            <span className="font-medium text-foreground text-right">
              {isLoading ? (
                "Checking..."
              ) : formattedLastSeen ? (
                <span>
                  {formattedLastSeen} <span className="text-muted-foreground text-[11px]">({lastSeenText})</span>
                </span>
              ) : (
                lastSeenText
              )}
            </span>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 flex items-start gap-2.5 text-xs">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div className="text-muted-foreground">
            <p className="font-medium text-foreground">Terminal Ready for Card Swipes</p>
            <p className="mt-0.5 text-[11px]">
              Direct RFID punches through the kiosk display instantly register in the live activity feed.
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer matching LiveActivityFeed */}
      <div className="p-3 sm:px-5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Kiosk Terminal Interface
        </span>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "gap-1.5 text-xs font-semibold h-7 shadow-xs"
          )}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Launch Kiosk</span>
        </a>
      </div>
    </Card>
  );
}
