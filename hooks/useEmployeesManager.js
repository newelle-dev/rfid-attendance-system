/**
 * Custom hook for managing employee records, filtering, and CRUD operations.
 */

import { useState, useCallback, useEffect, startTransition } from "react";
import { toast } from "sonner";

export const useEmployeesManager = () => {
  // Core data state
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    resigned: 0,
  });

  // Metadata state
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [leaders, setLeaders] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    position: "",
    status: "",
    leader: "",
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Slide-over Sheet states
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Deletion Dialog states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  /**
   * Fetches KPI Stats
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/admin/employees/stats");
      if (!res.ok) throw new Error("Failed to load employee metrics");
      const data = await res.json();
      setStats({
        total: data.total ?? data.active + data.inactive + data.resigned,
        active: data.active || 0,
        inactive: data.inactive || 0,
        resigned: data.resigned || 0,
      });
    } catch (err) {
      console.error("Error fetching employee stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Fetches metadata for dropdowns
   */
  const fetchMetadata = useCallback(async () => {
    try {
      setLoadingMetadata(true);
      const [deptRes, posRes, leadRes] = await Promise.all([
        fetch("/api/admin/departments"),
        fetch("/api/admin/positions"),
        fetch("/api/admin/leaders?limit=1000"),
      ]);

      if (deptRes.ok && posRes.ok && leadRes.ok) {
        const [deptData, posData, leadData] = await Promise.all([
          deptRes.json(),
          posRes.json(),
          leadRes.json(),
        ]);
        setDepartments(deptData.departments || []);
        setPositions(posData.positions || []);
        setLeaders(leadData.leaders || []);
      }
    } catch (err) {
      console.error("Error loading employee metadata:", err);
    } finally {
      setLoadingMetadata(false);
    }
  }, []);

  /**
   * Fetches employees with current filters and pagination
   */
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        search: searchQuery,
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        department: filters.department || "",
        position: filters.position || "",
        status: filters.status || "",
        leader: filters.leader || "",
      });

      const response = await fetch(`/api/admin/employees?${searchParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data.data || []);
      setTotalEmployees(data.total || 0);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, pagination.pageIndex, pagination.pageSize]);

  // Initial loads
  useEffect(() => {
    startTransition(() => {
      fetchEmployees();
    });
  }, [fetchEmployees]);

  useEffect(() => {
    startTransition(() => {
      fetchStats();
      fetchMetadata();
    });
  }, [fetchStats, fetchMetadata]);

  // Handle Search with debounce / reset page
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Handle faceted filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Handle clicking a KPI status card
  const handleStatusFilterChange = useCallback((statusValue) => {
    setFilters((prev) => ({
      ...prev,
      status: statusValue,
    }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilters({ department: "", position: "", status: "", leader: "" });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  // Refresh
  const refreshEmployees = useCallback(() => {
    fetchEmployees();
    fetchStats();
  }, [fetchEmployees, fetchStats]);

  // Open Dossier sheet
  const openDossier = useCallback((employee) => {
    setSelectedEmployee(employee);
    setIsDossierOpen(true);
    setIsFormSheetOpen(false);
  }, []);

  // Open Create Form sheet
  const openCreateForm = useCallback(() => {
    setSelectedEmployee(null);
    setIsFormSheetOpen(true);
    setIsDossierOpen(false);
  }, []);

  // Open Edit Form sheet
  const openEditForm = useCallback((employee) => {
    setSelectedEmployee(employee);
    setIsFormSheetOpen(true);
    setIsDossierOpen(false);
  }, []);

  // Handle form submission (create or update)
  const handleEmployeeSubmit = useCallback(
    async (formData, photoPreview) => {
      try {
        setSubmitting(true);
        const isEditing = Boolean(selectedEmployee);
        const url = isEditing
          ? `/api/admin/employees/${selectedEmployee.id}`
          : "/api/admin/employees";
        const method = isEditing ? "PUT" : "POST";

        const apiPayload = {
          ...formData,
          photo: photoPreview,
        };

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to save employee");
        }

        toast.success(
          `Employee ${isEditing ? "updated" : "created"} successfully`
        );
        setIsFormSheetOpen(false);
        setSelectedEmployee(null);

        // Refresh list and stats
        await Promise.all([fetchEmployees(), fetchStats()]);
      } catch (err) {
        console.error("Submission error:", err);
        toast.error(err.message || "Failed to save employee");
      } finally {
        setSubmitting(false);
      }
    },
    [selectedEmployee, fetchEmployees, fetchStats]
  );

  // Deletion dialog handlers
  const openDeleteDialog = useCallback((employee) => {
    setDeleteTarget(employee);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/employees?id=${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete employee");
      }

      toast.success(`Employee ${deleteTarget.name} deleted successfully`);
      setIsDeleteDialogOpen(false);

      if (selectedEmployee?.id === deleteTarget.id) {
        setIsDossierOpen(false);
        setIsFormSheetOpen(false);
        setSelectedEmployee(null);
      }
      setDeleteTarget(null);

      // Refresh data and stats
      await Promise.all([fetchEmployees(), fetchStats()]);
    } catch (err) {
      console.error("Deletion error:", err);
      toast.error(err.message || "Failed to delete employee");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, selectedEmployee, fetchEmployees, fetchStats]);

  // CSV Export handler
  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      toast.info("Generating CSV export...");

      const searchParams = new URLSearchParams({
        search: searchQuery,
        page: "1",
        limit: "10000",
        department: filters.department || "",
        position: filters.position || "",
        status: filters.status || "",
        leader: filters.leader || "",
      });

      const res = await fetch(`/api/admin/employees?${searchParams}`);
      if (!res.ok) throw new Error("Failed to export employees");

      const json = await res.json();
      const data = json.data || [];

      if (data.length === 0) {
        toast.warning("No employees matching current filter to export");
        return;
      }

      const headers = [
        "Ashima ID",
        "Full Name",
        "Department",
        "Position",
        "Reporting To",
        "RFID Tag",
        "Employment Type",
        "Status",
      ];

      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const csvRows = [
        headers.join(","),
        ...data.map((emp) =>
          [
            escapeCsv(emp.ashima_id),
            escapeCsv(emp.name),
            escapeCsv(emp.department),
            escapeCsv(emp.position),
            escapeCsv(emp.leader_name),
            escapeCsv(emp.rfid_tag),
            escapeCsv(emp.emp_stat),
            escapeCsv(emp.status),
          ].join(",")
        ),
      ];

      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `employees_roster_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} employee records to CSV`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error(err.message || "Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  }, [searchQuery, filters]);

  return {
    // Data
    employees,
    totalEmployees,
    stats,
    departments,
    positions,
    leaders,

    // Loading & Error
    loading,
    loadingStats,
    loadingMetadata,
    submitting,
    isDeleting,
    isExporting,
    error,

    // Filters & Pagination
    searchQuery,
    setSearchQuery: handleSearchChange,
    filters,
    setFilters: handleFilterChange,
    handleStatusFilterChange,
    resetFilters,
    pagination,
    setPagination,
    refreshEmployees,

    // Sheets & Dialogs
    isDossierOpen,
    setIsDossierOpen,
    isFormSheetOpen,
    setIsFormSheetOpen,
    selectedEmployee,
    openDossier,
    openCreateForm,
    openEditForm,
    handleEmployeeSubmit,

    // Deletion
    deleteTarget,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    openDeleteDialog,
    confirmDelete,

    // Export
    handleExportCsv,
  };
};
