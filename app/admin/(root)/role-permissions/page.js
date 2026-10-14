"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PermissionGuard from "@/components/auth/PermissionGuard";
import PageHeader from "@/components/admin/layout/PageHeader";
import RolePermissionsHeader from "@/components/admin/role-permissions/RolePermissionsHeader";
import RolePermissionsStatsCards from "@/components/admin/role-permissions/RolePermissionsStatsCards";
import RolePermissionsFilterBar from "@/components/admin/role-permissions/RolePermissionsFilterBar";
import PermissionsMatrixGrid from "@/components/admin/role-permissions/PermissionsMatrixGrid";
import RoleCardsView from "@/components/admin/role-permissions/RoleCardsView";
import RolePermissionsFloatingBar from "@/components/admin/role-permissions/RolePermissionsFloatingBar";
import ResetBaselineDialog from "@/components/admin/role-permissions/ResetBaselineDialog";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/admin/role-permissions/RolePermissionsStates";
import { Card, CardContent } from "@/components/ui/card";
import { useRolePermissionsManager } from "@/hooks/useRolePermissionsManager";
import { MODULES } from "@/components/admin/role-permissions/constants";

/**
 * Role Permissions Management Command Center
 * 4-Tier Security Governance Hub for RBAC matrix policies, role authorizations,
 * staged draft updates, and baseline restoration.
 */
export default function RolePermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    // Dataset & headcounts
    permissions,
    accountStats,
    filteredModules,
    visibleRoles,

    // Staged diff tracking
    modifiedList,
    hasChanges,
    modifiedCount,

    // Network & Loading
    loading,
    loadingStats,
    saving,
    error,
    clearError,
    refreshData,

    // View & Filter states
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    activeRoleFilter,
    setActiveRoleFilter,
    handleKpiClick,

    // Mutation actions
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
    handleExportCsv,
  } = useRolePermissionsManager();

  // Root Superadmin Authorization Guard
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "superadmin") {
      router.push("/admin");
    }
  }, [session, status, router]);

  // Error toast notification
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  /**
   * Handle committing staged permissions
   */
  const handleSave = async () => {
    const res = await savePermissions();
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  /**
   * Handle applying the system recommended baseline
   */
  const handleConfirmBaseline = () => {
    applyRecommendedBaseline();
    toast.info("Recommended baseline staged. Review and click 'Save Changes' to persist.");
  };

  /**
   * Handle discarding staged changes
   */
  const handleDiscard = () => {
    discardChanges();
    toast.info("Staged permission modifications discarded.");
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = async () => {
    await refreshData();
    toast.success("Role permissions refreshed successfully.");
  };

  return (
    <PermissionGuard module="role_permissions" allowSuperadminOverride={true}>
      <div className="space-y-6">
        {/* Tier 1: Page Header with Breadcrumbs & Real-time Clock */}
        <PageHeader />

        {/* Tier 2: Module Command Header */}
        <RolePermissionsHeader
          activeView={activeView}
          onViewChange={setActiveView}
          onOpenBaselineModal={() => setIsBaselineModalOpen(true)}
          onRefresh={handleRefresh}
          onExportCsv={handleExportCsv}
          loading={loading}
          isExporting={isExporting}
          hasChanges={hasChanges}
        />

        {/* Tier 3: Interactive Role Access & Headcount KPI Strip */}
        <RolePermissionsStatsCards
          permissions={permissions}
          accountStats={accountStats}
          loading={loading || loadingStats}
          activeRoleFilter={activeRoleFilter}
          onKpiClick={handleKpiClick}
        />

        {/* Tier 4: Main Workspace Card */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Filter Toolbar */}
            <RolePermissionsFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              activeRoleFilter={activeRoleFilter}
              onClearRoleFilter={() => setActiveRoleFilter(null)}
              totalResults={filteredModules.length}
              totalModules={MODULES.length}
            />

            {/* Workspace Content States */}
            {loading ? (
              <LoadingState message="Loading security access policies..." />
            ) : error ? (
              <ErrorState error={error} onRetry={refreshData} />
            ) : filteredModules.length === 0 ? (
              <EmptyState
                hasFilters={Boolean(searchQuery.trim() || categoryFilter !== "all" || activeRoleFilter)}
                onResetFilters={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setActiveRoleFilter(null);
                }}
              />
            ) : activeView === "matrix" ? (
              <PermissionsMatrixGrid
                modules={filteredModules}
                roles={visibleRoles}
                permissions={permissions}
                modifiedList={modifiedList}
                onToggle={togglePermission}
                onSetRoleAll={setRoleAll}
              />
            ) : (
              <RoleCardsView
                modules={filteredModules}
                roles={visibleRoles}
                permissions={permissions}
                accountStats={accountStats}
                modifiedList={modifiedList}
                onToggle={togglePermission}
                onSetRoleAll={setRoleAll}
              />
            )}
          </CardContent>
        </Card>

        {/* Floating Staged Draft Action Bar */}
        <RolePermissionsFloatingBar
          modifiedCount={modifiedCount}
          saving={saving}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />

        {/* Baseline Reset Confirmation Dialog */}
        <ResetBaselineDialog
          open={isBaselineModalOpen}
          onOpenChange={setIsBaselineModalOpen}
          onConfirm={handleConfirmBaseline}
        />
      </div>
    </PermissionGuard>
  );
}
