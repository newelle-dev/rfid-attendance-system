"use client";

import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";

/**
 * Helper to escape CSV cell contents safely
 */
const escapeCsv = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Custom hook for Data Management (Departments, Positions, Leaders)
 */
export function useDataManagement() {
  const [, startTransition] = useTransition();

  // Active Tab state: 'departments' | 'positions' | 'leaders'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab");
      if (urlTab && ["departments", "positions", "leaders"].includes(urlTab)) {
        return urlTab;
      }
    }
    return "departments";
  });

  // KPI Statistics
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalPositions: 0,
    leadershipPositions: 0,
    activeLeaders: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Tab Data states
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [leaders, setLeaders] = useState([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("all"); // 'all' | 'leaders' | 'standard'

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Add / Edit Modal Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' | 'edit'
  const [editingItem, setEditingItem] = useState(null);

  // Deletion Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Debounce search input
  const debounceTimerRef = useRef(null);
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      setDebouncedSearch(value);
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Sync tab change with URL without page refresh
  const handleTabChange = useCallback((newTab) => {
    if (!["departments", "positions", "leaders"].includes(newTab)) return;
    setActiveTab(newTab);
    setSearchQuery("");
    setDebouncedSearch("");
    setPositionFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setError(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  /**
   * Fetch aggregate statistics for the KPI strip
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/lists/stats");
      if (!res.ok) throw new Error("Failed to fetch statistics");
      const data = await res.json();
      setStats({
        totalDepartments: Number(data.totalDepartments || 0),
        totalPositions: Number(data.totalPositions || 0),
        leadershipPositions: Number(data.leadershipPositions || 0),
        activeLeaders: Number(data.activeLeaders || 0),
      });
    } catch (err) {
      console.error("Error loading list stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Fetch data for the currently active tab
   */
  const fetchCurrentTabData = useCallback(
    async (targetPage = pagination.page, targetLimit = pagination.limit, targetSearch = debouncedSearch) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(targetLimit),
        });

        if (targetSearch) {
          params.append("search", targetSearch);
        }

        if (activeTab === "departments") {
          const res = await fetch(`/api/admin/departments?${params.toString()}`);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to load departments");
          }
          const data = await res.json();
          setDepartments(data.departments || []);
          setPagination({
            page: data.pagination.page,
            limit: data.pagination.limit,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages || 1,
          });
        } else if (activeTab === "positions") {
          if (positionFilter === "leaders") {
            params.append("isLeader", "1");
          } else if (positionFilter === "standard") {
            params.append("isLeader", "0");
          }

          const res = await fetch(`/api/admin/positions?${params.toString()}`);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to load positions");
          }
          const data = await res.json();
          setPositions(data.positions || []);
          setPagination({
            page: data.pagination.page,
            limit: data.pagination.limit,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages || 1,
          });
        } else if (activeTab === "leaders") {
          const res = await fetch(`/api/admin/leaders?${params.toString()}`);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to load leaders");
          }
          const data = await res.json();
          setLeaders(data.leaders || []);
          setPagination({
            page: data.pagination.page,
            limit: data.pagination.limit,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages || 1,
          });
        }
      } catch (err) {
        console.error(`Failed to fetch ${activeTab}:`, err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, debouncedSearch, positionFilter, pagination.page, pagination.limit]
  );

  // Fetch KPI stats on initial mount
  useEffect(() => {
    startTransition(() => {
      fetchStats();
    });
  }, [fetchStats]);

  // Fetch active tab data whenever activeTab, pagination, or debounced search changes
  useEffect(() => {
    startTransition(() => {
      fetchCurrentTabData();
    });
  }, [fetchCurrentTabData]);

  // Position filter change
  const handlePositionFilterChange = (filter) => {
    setPositionFilter(filter);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Pagination page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setPositionFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Check if filters are active
  const isFiltered = Boolean(searchQuery.trim()) || (activeTab === "positions" && positionFilter !== "all");

  // KPI Card click navigation
  const handleKpiClick = useCallback(
    (cardId) => {
      if (cardId === "departments") {
        handleTabChange("departments");
      } else if (cardId === "positions") {
        handleTabChange("positions");
        setPositionFilter("all");
      } else if (cardId === "leadership") {
        handleTabChange("positions");
        setPositionFilter("leaders");
      } else if (cardId === "leaders") {
        handleTabChange("leaders");
      }
    },
    [handleTabChange]
  );

  /**
   * Add / Edit Modal Dialog Controls
   */
  const openAddDialog = useCallback(() => {
    setDialogMode("add");
    setEditingItem(null);
    setIsDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((item) => {
    setDialogMode("edit");
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingItem(null);
  }, []);

  /**
   * Save handler (Create / Update)
   */
  const handleSave = async (formData) => {
    try {
      setSubmitting(true);
      const isEdit = dialogMode === "edit" && Boolean(editingItem?.id);
      const endpoint = activeTab === "departments" ? "/api/admin/departments" : "/api/admin/positions";
      const url = isEdit ? `${endpoint}/${editingItem.id}` : endpoint;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resData.error || `Failed to ${isEdit ? "update" : "create"} ${activeTab === "departments" ? "department" : "position"}`);
      }

      toast.success(
        `${activeTab === "departments" ? "Department" : "Position"} ${isEdit ? "updated" : "created"} successfully`
      );

      closeDialog();
      fetchCurrentTabData();
      fetchStats();
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Deletion Dialog Controls
   */
  const openDeleteDialog = useCallback((item) => {
    setDeleteTarget(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const endpoint = activeTab === "departments" ? `/api/admin/departments/${deleteTarget.id}` : `/api/admin/positions/${deleteTarget.id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Failed to delete ${activeTab === "departments" ? "department" : "position"}`);
      }

      toast.success(
        `${activeTab === "departments" ? "Department" : "Position"} deleted successfully`
      );

      closeDeleteDialog();

      const currentListLength = activeTab === "departments" ? departments.length : positions.length;
      if (currentListLength === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        fetchCurrentTabData();
      }
      fetchStats();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Export current tab data to CSV
   */
  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);

      let csvRows = [];
      const timestamp = new Date().toISOString().split("T")[0];

      if (activeTab === "departments") {
        const res = await fetch("/api/admin/departments?limit=1000");
        if (!res.ok) throw new Error("Failed to export departments");
        const data = await res.json();
        const depts = data.departments || [];

        csvRows = [
          ["ID", "Department Name", "Total Assigned Personnel", "Active Personnel"].join(","),
          ...depts.map((d) =>
            [
              escapeCsv(d.id),
              escapeCsv(d.name),
              escapeCsv(d.employee_count ?? 0),
              escapeCsv(d.active_employee_count ?? 0),
            ].join(",")
          ),
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `departments_directory_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${depts.length} departments to CSV`);
      } else if (activeTab === "positions") {
        const res = await fetch("/api/admin/positions?limit=1000");
        if (!res.ok) throw new Error("Failed to export positions");
        const data = await res.json();
        const posList = data.positions || [];

        csvRows = [
          ["ID", "Position Title", "Role Type", "Assigned Staff Count", "Active Staff Count"].join(","),
          ...posList.map((p) =>
            [
              escapeCsv(p.id),
              escapeCsv(p.name),
              escapeCsv(p.is_leader ? "Leadership Role" : "Standard Role"),
              escapeCsv(p.employee_count ?? 0),
              escapeCsv(p.active_employee_count ?? 0),
            ].join(",")
          ),
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `positions_directory_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${posList.length} positions to CSV`);
      } else if (activeTab === "leaders") {
        const res = await fetch("/api/admin/leaders?limit=1000");
        if (!res.ok) throw new Error("Failed to export leaders");
        const data = await res.json();
        const ldrList = data.leaders || [];

        csvRows = [
          ["Ashima ID", "Leader Name", "Position", "Department", "Team Count"].join(","),
          ...ldrList.map((l) =>
            [
              escapeCsv(l.ashima_id || "N/A"),
              escapeCsv(l.name),
              escapeCsv(l.position_name || "N/A"),
              escapeCsv(l.department_name || "N/A"),
              escapeCsv(l.team_count ?? 0),
            ].join(",")
          ),
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `leaders_roster_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported ${ldrList.length} leaders to CSV`);
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  }, [activeTab]);

  return {
    // Tab & Navigation
    activeTab,
    handleTabChange,

    // Stats
    stats,
    loadingStats,
    handleKpiClick,

    // Tab Datasets
    departments,
    positions,
    leaders,

    // Loading & Status
    loading,
    error,
    submitting,
    isDeleting,
    isExporting,
    refreshData: () => {
      fetchCurrentTabData();
      fetchStats();
    },

    // Search & Filters
    searchQuery,
    setSearchQuery: handleSearchChange,
    positionFilter,
    handlePositionFilterChange,
    isFiltered,
    resetFilters,

    // Pagination
    pagination,
    handlePageChange,

    // Add / Edit Modal Dialog
    isDialogOpen,
    dialogMode,
    editingItem,
    openAddDialog,
    openEditDialog,
    closeDialog,
    handleSave,

    // Deletion Dialog
    deleteTarget,
    isDeleteDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,

    // Export
    handleExportCsv,
  };
}
