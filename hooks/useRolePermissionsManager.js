import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  normalizePermissions, 
  getModifiedPermissions, 
  getBaselinePermissions,
  isProtectedPermission,
  exportPermissionsCsv
} from "@/components/admin/role-permissions/utils";
import { MODULES, ROLES } from "@/components/admin/role-permissions/constants";

/**
 * Enterprise Custom Hook for Role Permissions Management
 * Manages 4x5 canonical matrix state, staged draft modifications, live account headcounts,
 * baseline restore, search/category filters, and batch saving.
 */
export const useRolePermissionsManager = () => {
  const { data: session } = useSession();
  
  // Matrix data states
  const [permissions, setPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [accountStats, setAccountStats] = useState({
    total: 0,
    superadmin: 0,
    admin: 0,
    security: 0,
    hr: 0
  });

  // UI & network states
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // View & filter states
  const [activeView, setActiveView] = useState("matrix"); // 'matrix' | 'cards'
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeRoleFilter, setActiveRoleFilter] = useState(null); // null means all roles visible
  const [isBaselineModalOpen, setIsBaselineModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Fetch both permissions and account stats
   */
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
        setLoadingStats(true);
      }

      const [permRes, statsRes] = await Promise.all([
        fetch("/api/admin/role-permissions"),
        fetch("/api/admin/accounts/stats").catch(() => null)
      ]);

      setError(null);

      if (!permRes.ok) {
        const errorData = await permRes.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${permRes.status}`);
      }

      const permData = await permRes.json();
      const normalized = normalizePermissions(permData.permissions || []);
      setPermissions(normalized);
      setOriginalPermissions(normalized);

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setAccountStats(statsData);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(err.message || "Failed to load permissions. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Modified cells diff list
   */
  const modifiedList = useMemo(() => {
    return getModifiedPermissions(permissions, originalPermissions);
  }, [permissions, originalPermissions]);

  const hasChanges = modifiedList.length > 0;

  /**
   * Toggle a specific permission for role + module
   */
  const togglePermission = useCallback((role, moduleName, nextValue) => {
    if (isProtectedPermission(role, moduleName)) {
      return; // Root protected invariant
    }

    setPermissions((prev) =>
      prev.map((p) => {
        if (p.role === role && p.module === moduleName) {
          return {
            ...p,
            permission: {
              ...p.permission,
              access: typeof nextValue === "boolean" ? nextValue : !p.permission?.access
            }
          };
        }
        return p;
      })
    );
  }, []);

  /**
   * Bulk grant or revoke all modules for a specific role
   */
  const setRoleAll = useCallback((role, accessValue) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.role === role) {
          if (isProtectedPermission(role, p.module)) {
            return p;
          }
          return {
            ...p,
            permission: { ...p.permission, access: accessValue }
          };
        }
        return p;
      })
    );
  }, []);

  /**
   * Apply recommended security baseline
   */
  const applyRecommendedBaseline = useCallback(() => {
    const baseline = getBaselinePermissions();
    setPermissions(baseline);
    setIsBaselineModalOpen(false);
  }, []);

  /**
   * Discard all pending staged draft modifications
   */
  const discardChanges = useCallback(() => {
    setPermissions([...originalPermissions]);
  }, [originalPermissions]);

  /**
   * Persist staged permissions to database via PUT endpoint
   */
  const savePermissions = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch("/api/admin/role-permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      setOriginalPermissions([...permissions]);
      return { success: true, message: "Security matrix permissions updated successfully!" };
    } catch (err) {
      console.error("Error saving permissions:", err);
      setError(err.message || "Failed to save permissions.");
      return { success: false, message: err.message || "Failed to save permissions." };
    } finally {
      setSaving(false);
    }
  }, [permissions]);

  /**
   * Export RBAC Matrix as CSV
   */
  const handleExportCsv = useCallback(async () => {
    try {
      setIsExporting(true);
      exportPermissionsCsv(permissions);
    } finally {
      setIsExporting(false);
    }
  }, [permissions]);

  /**
   * Filtered modules based on search query and category
   */
  const filteredModules = useMemo(() => {
    return MODULES.filter((m) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        m.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.value.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = 
        categoryFilter === "all" || m.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  /**
   * Roles displayed in matrix/cards, accounting for active role filter
   */
  const visibleRoles = useMemo(() => {
    if (!activeRoleFilter) return ROLES;
    return ROLES.filter((r) => r.value === activeRoleFilter);
  }, [activeRoleFilter]);

  /**
   * Interactive KPI card click handler (toggles filter)
   */
  const handleKpiClick = useCallback((roleValue) => {
    setActiveRoleFilter((prev) => (prev === roleValue ? null : roleValue));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshData = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    // Session
    session,

    // Data
    permissions,
    originalPermissions,
    accountStats,
    filteredModules,
    visibleRoles,

    // Diff & Staged state
    modifiedList,
    hasChanges,
    modifiedCount: modifiedList.length,

    // Network & Loading
    loading,
    loadingStats,
    saving,
    error,
    clearError,
    refreshData,

    // View & Filters
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    activeRoleFilter,
    setActiveRoleFilter,
    handleKpiClick,

    // Actions
    togglePermission,
    setRoleAll,
    discardChanges,
    savePermissions,
    applyRecommendedBaseline,

    // Baseline Modal
    isBaselineModalOpen,
    setIsBaselineModalOpen,

    // CSV Export
    isExporting,
    handleExportCsv
  };
};
