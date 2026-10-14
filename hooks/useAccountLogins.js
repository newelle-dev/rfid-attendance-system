"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import dayjs from "dayjs";

/**
 * Helper to escape strings for CSV output
 */
function escapeCsv(value) {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
}

/**
 * useAccountLogins Hook
 * Centralizes data management, search debouncing, faceted filtering, pagination,
 * CSV export, and CRUD dialogs for admin user accounts.
 */
export function useAccountLogins() {
  const { data: session } = useSession();
  const [, startTransition] = useTransition();

  // Core dataset state
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // KPI Stats state
  const [stats, setStats] = useState({
    total: 0,
    superadmin: 0,
    admin: 0,
    security: 0,
    hr: 0,
    recentAccounts: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Async operation flags
  const [isExporting, setIsExporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add / Edit Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingAccount, setEditingAccount] = useState(null);

  // Delete Confirmation state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(null);

  // Debounce search query input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  /**
   * Fetch aggregate KPI statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/accounts/stats");
      if (!res.ok) throw new Error("Failed to load account statistics");
      const data = await res.json();
      setStats({
        total: data.total || 0,
        superadmin: data.superadmin || 0,
        admin: data.admin || 0,
        security: data.security || 0,
        hr: data.hr || 0,
        recentAccounts: data.recentAccounts || 0,
      });
    } catch (err) {
      console.error("Error fetching account stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Fetch paginated accounts based on active filters
   */
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      if (roleFilter && roleFilter !== "all") {
        params.set("role", roleFilter);
      }

      const res = await fetch(`/api/admin/accounts?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch accounts");
      }

      const data = await res.json();
      setAccounts(data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
        totalPages: data.pageCount || 1,
      }));
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err.message || "Failed to load account records");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, pagination.page, pagination.limit]);

  // Initial load
  useEffect(() => {
    startTransition(() => {
      fetchStats();
    });
  }, [fetchStats]);

  // Fetch accounts on filter/pagination changes
  useEffect(() => {
    startTransition(() => {
      fetchAccounts();
    });
  }, [fetchAccounts]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(() => {
    startTransition(() => {
      fetchAccounts();
      fetchStats();
    });
  }, [fetchAccounts, fetchStats]);

  /**
   * Filter handlers
   */
  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setRoleFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const isFiltered = Boolean(searchQuery.trim()) || roleFilter !== "all";

  /**
   * KPI Card Click -> quick-filter to role
   */
  const handleKpiClick = useCallback((kpiId) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    switch (kpiId) {
      case "total":
        setRoleFilter("all");
        break;
      case "admin_tier":
        // Toggle or set to admin
        setRoleFilter((prev) => (prev === "admin" ? "superadmin" : "admin"));
        break;
      case "security":
        setRoleFilter((prev) => (prev === "security" ? "all" : "security"));
        break;
      case "hr":
        setRoleFilter((prev) => (prev === "hr" ? "all" : "hr"));
        break;
      default:
        setRoleFilter("all");
    }
  }, []);

  /**
   * Pagination handlers
   */
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: Number(newLimit),
      page: 1,
    }));
  };

  /**
   * Form Dialog open/close
   */
  const openAddDialog = useCallback(() => {
    setFormMode("create");
    setEditingAccount(null);
    setIsFormOpen(true);
  }, []);

  const openEditDialog = useCallback((account) => {
    setFormMode("edit");
    setEditingAccount(account);
    setIsFormOpen(true);
  }, []);

  const closeFormDialog = useCallback(() => {
    setIsFormOpen(false);
    setEditingAccount(null);
  }, []);

  /**
   * Form submission (Create or Update)
   */
  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (formMode === "create") {
        const res = await fetch("/api/admin/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to create account");
        }

        toast.success("Account created successfully");
        closeFormDialog();
        refreshData();
        return true;
      } else {
        // Edit mode
        const res = await fetch(`/api/admin/accounts/${editingAccount.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update account");
        }

        toast.success("Account updated successfully");
        closeFormDialog();
        refreshData();
        return true;
      }
    } catch (err) {
      console.error("Error submitting account:", err);
      toast.error(err.message || "Failed to save account");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Delete dialog open/close/confirm
   */
  const openDeleteDialog = useCallback((account) => {
    setDeletingAccount(account);
    setIsDeleteOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteOpen(false);
    setDeletingAccount(null);
  }, []);

  const confirmDelete = async () => {
    if (!deletingAccount) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/accounts/${deletingAccount.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success(data.message || `Account '${deletingAccount.username}' removed`);
      closeDeleteDialog();
      refreshData();
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error(err.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Export accounts to CSV
   */
  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);

      const params = new URLSearchParams({ limit: "1000", page: "1" });
      if (roleFilter && roleFilter !== "all") params.set("role", roleFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/accounts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to export accounts");

      const data = await res.json();
      const accountsList = data.data || [];

      if (accountsList.length === 0) {
        toast.info("No account records available to export");
        return;
      }

      const timestamp = dayjs().format("YYYY-MM-DD_HHmm");
      const csvRows = [
        [
          "ID",
          "Full Name",
          "Username",
          "Ashima ID",
          "Role",
          "Linked Department",
          "Linked Position",
          "Last Login",
          "Created Date",
        ].join(","),
        ...accountsList.map((acc) =>
          [
            escapeCsv(acc.id),
            escapeCsv(acc.name),
            escapeCsv(acc.username),
            escapeCsv(acc.employeeId),
            escapeCsv(acc.role),
            escapeCsv(acc.linkedEmployee?.department || "Unassigned"),
            escapeCsv(acc.linkedEmployee?.position || "Staff"),
            escapeCsv(acc.lastLogin ? dayjs(acc.lastLogin).format("YYYY-MM-DD HH:mm:ss") : "Never"),
            escapeCsv(acc.createdAt ? dayjs(acc.createdAt).format("YYYY-MM-DD") : ""),
          ].join(",")
        ),
      ];

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `admin_accounts_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${accountsList.length} accounts to CSV`);
    } catch (err) {
      console.error("CSV export error:", err);
      toast.error(err.message || "Failed to export accounts to CSV");
    } finally {
      setIsExporting(false);
    }
  }, [roleFilter, debouncedSearch]);

  return {
    // Current user session info
    session,
    canManageSuperAdmin: session?.user?.role === "superadmin",

    // Dataset & Loading
    accounts,
    loading,
    error,
    refreshData,

    // KPI Metrics
    stats,
    loadingStats,
    handleKpiClick,

    // Search & Faceted Filter
    searchQuery,
    setSearchQuery,
    roleFilter,
    handleRoleFilterChange,
    resetFilters,
    isFiltered,

    // Pagination
    pagination,
    handlePageChange,
    handleLimitChange,

    // Add / Edit Modal Dialog
    isFormOpen,
    formMode,
    editingAccount,
    submitting,
    openAddDialog,
    openEditDialog,
    closeFormDialog,
    handleFormSubmit,

    // Deletion Confirmation Dialog
    isDeleteOpen,
    deletingAccount,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,

    // CSV Export
    isExporting,
    handleExportCsv,
  };
}