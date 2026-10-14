"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/admin/layout/PageHeader";
import CommandHeader from "@/components/admin/dashboard/CommandHeader";
import HeadcountKPIGrid from "@/components/admin/dashboard/HeadcountKPIGrid";
import LiveActivityFeed from "@/components/admin/dashboard/LiveActivityFeed";
import KioskStatusCard from "@/components/admin/dashboard/KioskStatusCard";

const DEFAULT_POLL_INTERVAL = 15; // in seconds

export default function AdminDashboard() {
  const { data: session } = useSession();

  // Dashboard Data State
  const [data, setData] = useState({
    summary: {
      totalActiveEmployees: 0,
      currentlyPresent: 0,
      onBreak: 0,
      timedOut: 0,
      notYetIn: 0,
      attendanceRate: 0,
      totalScansToday: 0,
    },
    kioskStatus: {
      deviceId: "KIOSK-MAIN-01",
      status: "idle",
      lastScanAt: null,
      scansToday: 0,
    },
    recentLogs: [],
    departments: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dbError, setDbError] = useState(null);

  // Polling State
  const [isPolling, setIsPolling] = useState(true);
  const [countdown, setCountdown] = useState(DEFAULT_POLL_INTERVAL);
  const isPollingRef = useRef(isPolling);

  useEffect(() => {
    isPollingRef.current = isPolling;
  }, [isPolling]);

  /**
   * Fetch dashboard metrics from API
   */
  const fetchData = useCallback(async (isBackground = false) => {
    try {
      if (isBackground) {
        setIsRefreshing(true);
      }

      const res = await fetch("/api/admin/dashboard/stats", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 503 || result.isDbOffline) {
          setDbError(result.message || "MySQL database is offline. Please start your local MySQL service.");
          setIsPolling(false);
          return;
        }
        throw new Error(result.error || `Server returned ${res.status}`);
      }

      setDbError(null);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      if (!isBackground) {
        toast.error("Failed to load dashboard metrics. Retrying in background...");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchData(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  /**
   * Background polling ticker with visibility awareness
   */
  useEffect(() => {
    const timer = setInterval(() => {
      // Pause ticker if document is hidden or user paused polling
      if (!isPollingRef.current || document.visibilityState === "hidden") {
        return;
      }

      setCountdown((prev) => {
        if (prev <= 1) {
          fetchData(true);
          return DEFAULT_POLL_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchData]);

  /**
   * Handle user manual refresh
   */
  const handleRefresh = () => {
    setCountdown(DEFAULT_POLL_INTERVAL);
    fetchData(true);
  };

  /**
   * Handle toggle polling
   */
  const handleTogglePolling = () => {
    setIsPolling((prev) => !prev);
    if (!isPolling) {
      setCountdown(DEFAULT_POLL_INTERVAL);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <PageHeader />

      {/* Database Connection Alert Banner */}
      {dbError && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Database Connection Offline</p>
              <p className="text-xs text-destructive/80 mt-0.5">{dbError}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-destructive/30 hover:bg-destructive/10 text-destructive text-xs shrink-0"
          >
            <RotateCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Retry Connection
          </Button>
        </div>
      )}

      {/* Operational Command Header with Greeting & Live Polling Toolbar */}
      <CommandHeader
        session={session}
        isPolling={isPolling}
        countdown={countdown}
        onTogglePolling={handleTogglePolling}
        onRefresh={handleRefresh}
        isLoading={isRefreshing || isLoading}
        lastUpdated={lastUpdated}
        systemStatus={data.kioskStatus?.status || "online"}
      />

      {/* 4-State Live Headcount KPI Grid */}
      <HeadcountKPIGrid 
        summary={data.summary} 
        isLoading={isLoading} 
      />

      {/* 2-Column Operational Grid: Left (Feed) / Right (Kiosk Health) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Live Activity Feed (60%) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <LiveActivityFeed 
            logs={data.recentLogs} 
            isLoading={isLoading} 
          />
        </section>

        {/* Right Column: Kiosk Health (40%) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <KioskStatusCard 
            kioskStatus={data.kioskStatus} 
            isLoading={isLoading} 
          />
        </section>
      </div>
    </div>
  );
}
