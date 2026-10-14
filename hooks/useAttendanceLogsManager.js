"use client";

import { useState, useCallback, useEffect, useMemo, useRef, startTransition } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";

/**
 * Custom hook for managing attendance logs data, filters, live auto-polling, and slide-over inspection.
 */
export const useAttendanceLogsManager = () => {
  // Core data states
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [stats, setStats] = useState({
    total_logs: 0,
    in_only: 0,
    complete_logs: 0,
    todayCount: 0,
  });
  const [departments, setDepartments] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    logType: "ALL",
    department: "",
    startDate: "",
    endDate: "",
    datePreset: "all",
  });

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });

  // Slide-over inspection sheet state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Live Auto-Refresh (30s polling)
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetches KPI Statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/attendance-logs/stats");
      if (!res.ok) throw new Error("Failed to load statistics");
      const data = await res.json();
      setStats({
        total_logs: data.total_logs || 0,
        in_only: data.in_only || 0,
        complete_logs: data.complete_logs || 0,
        todayCount: data.todayCount || 0,
      });
    } catch (err) {
      console.error("Attendance stats error:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Fetches Departments for dropdown selection
   */
  const fetchDepartments = useCallback(async () => {
    try {
      setLoadingDepartments(true);
      const res = await fetch("/api/admin/departments");
      if (!res.ok) throw new Error("Failed to load departments");
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error("Departments fetch error:", err);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  /**
   * Fetches Paginated Attendance Logs
   */
  const fetchLogs = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          page: String(pagination.pageIndex + 1),
          limit: String(pagination.pageSize),
          search: searchQuery.trim(),
          log_type: filters.logType === "ALL" ? "" : filters.logType,
          department: filters.department || "",
          start_date: filters.startDate || "",
          end_date: filters.endDate || "",
        });

        const res = await fetch(`/api/admin/attendance-logs?${params}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch attendance logs");
        }

        const data = await res.json();
        setLogs(data.data || []);
        setTotalLogs(data.total || 0);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Attendance logs error:", err);
        setError(err.message);
        if (!isBackground) {
          toast.error(err.message || "Failed to load logs");
        }
      } finally {
        if (!isBackground) {
          setLoading(false);
        }
      }
    },
    [
      pagination.pageIndex,
      pagination.pageSize,
      searchQuery,
      filters.logType,
      filters.department,
      filters.startDate,
      filters.endDate,
    ]
  );

  // Initial loads
  useEffect(() => {
    startTransition(() => {
      fetchStats();
      fetchDepartments();
    });
  }, [fetchStats, fetchDepartments]);

  useEffect(() => {
    startTransition(() => {
      fetchLogs();
    });
  }, [fetchLogs]);

  // Live Polling Effect (30s interval when autoRefresh is enabled)
  const timerRef = useRef(null);
  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchLogs(true);
        fetchStats();
      }, 30000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, fetchLogs, fetchStats]);

  /**
   * Search Input Handler (resets to page 1)
   */
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  /**
   * Filter Change Handler
   */
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  /**
   * Date Preset Shortcut Handler
   */
  const handleDatePreset = useCallback((preset) => {
    const today = dayjs().format("YYYY-MM-DD");
    let startDate = "";
    let endDate = "";

    switch (preset) {
      case "today":
        startDate = today;
        endDate = today;
        break;
      case "yesterday":
        startDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");
        endDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");
        break;
      case "week":
        startDate = dayjs().subtract(6, "day").format("YYYY-MM-DD");
        endDate = today;
        break;
      case "month":
        startDate = dayjs().startOf("month").format("YYYY-MM-DD");
        endDate = today;
        break;
      case "all":
      default:
        startDate = "";
        endDate = "";
        break;
    }

    setFilters((prev) => ({
      ...prev,
      datePreset: preset,
      startDate,
      endDate,
    }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  /**
   * Custom Date Range Setter
   */
  const handleCustomDateRange = useCallback((start, end) => {
    setFilters((prev) => ({
      ...prev,
      datePreset: "custom",
      startDate: start || "",
      endDate: end || "",
    }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  /**
   * Reset All Filters
   */
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilters({
      logType: "ALL",
      department: "",
      startDate: "",
      endDate: "",
      datePreset: "all",
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  /**
   * Interactive KPI click handler
   */
  const handleKpiClick = useCallback(
    (cardType) => {
      if (cardType === "in_only") {
        setFilters((prev) => ({
          ...prev,
          logType: prev.logType === "IN" ? "ALL" : "IN",
        }));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      } else if (cardType === "complete_logs") {
        setFilters((prev) => ({
          ...prev,
          logType: prev.logType === "OUT" ? "ALL" : "OUT",
        }));
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      } else if (cardType === "todayCount") {
        if (filters.datePreset === "today") {
          handleDatePreset("all");
        } else {
          handleDatePreset("today");
        }
      } else if (cardType === "total_logs") {
        resetFilters();
      }
    },
    [filters.datePreset, handleDatePreset, resetFilters]
  );

  /**
   * Manual Refresh
   */
  const refreshLogs = useCallback(() => {
    fetchLogs(false);
    fetchStats();
  }, [fetchLogs, fetchStats]);

  /**
   * CSV Export with active filters
   */
  const handleExportCsv = useCallback(async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({
        search: searchQuery.trim(),
        log_type: filters.logType === "ALL" ? "" : filters.logType,
        department: filters.department || "",
        start_date: filters.startDate || "",
        end_date: filters.endDate || "",
      });

      const res = await fetch(`/api/admin/attendance-logs/export?${params}`);
      if (!res.ok) {
        throw new Error("Failed to export attendance logs");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_logs_${dayjs().format("YYYY-MM-DD")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Attendance logs exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err.message || "Failed to export logs");
    } finally {
      setExporting(false);
    }
  }, [searchQuery, filters]);

  /**
   * Open Slide-Over Detail Sheet
   */
  const openDetailSheet = useCallback((log) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  }, []);

  /**
   * Computed: Check if any active filter is applied
   */
  const isFiltered = useMemo(() => {
    return (
      Boolean(searchQuery.trim()) ||
      filters.logType !== "ALL" ||
      Boolean(filters.department) ||
      Boolean(filters.startDate) ||
      Boolean(filters.endDate)
    );
  }, [searchQuery, filters]);

  return {
    // Data states
    logs,
    totalLogs,
    stats,
    departments,

    // Loading & Error states
    loading,
    loadingStats,
    loadingDepartments,
    exporting,
    error,

    // Search, Filters & Pagination
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    pagination,
    setPagination,
    isFiltered,

    // Filter Actions
    handleSearchChange,
    handleFilterChange,
    handleDatePreset,
    handleCustomDateRange,
    resetFilters,
    handleKpiClick,

    // Actions & Polling
    refreshLogs,
    handleExportCsv,
    autoRefresh,
    setAutoRefresh,
    lastUpdated,

    // Slide-over Sheet
    selectedLog,
    isDetailOpen,
    setIsDetailOpen,
    openDetailSheet,
  };
};
