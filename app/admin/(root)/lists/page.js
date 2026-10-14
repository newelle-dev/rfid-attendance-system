"use client";

import React from "react";
import PermissionGuard from "@/components/auth/PermissionGuard";
import PageHeader from "@/components/admin/layout/PageHeader";
import DataManagementHeader from "@/components/admin/lists/DataManagementHeader";
import DataManagementStatsCards from "@/components/admin/lists/DataManagementStatsCards";
import DataManagementFilterBar from "@/components/admin/lists/DataManagementFilterBar";
import DepartmentTable from "@/components/admin/lists/DepartmentTable";
import PositionTable from "@/components/admin/lists/PositionTable";
import LeaderTable from "@/components/admin/lists/LeaderTable";
import DataManagementDialog from "@/components/admin/lists/DataManagementDialog";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/admin/lists/DataManagementStates";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataManagement } from "@/hooks/useDataManagement";

/**
 * ListsPage Component (Data Management)
 * Redesigned 4-Tier Command Hub for organization units, job classifications,
 * leadership roles, and headcounts.
 */
export default function ListsPage() {
  const {
    // Navigation & Tabs
    activeTab,
    handleTabChange,

    // KPI Metrics
    stats,
    loadingStats,
    handleKpiClick,

    // Tab Datasets
    departments,
    positions,
    leaders,

    // Status & Loading
    loading,
    error,
    submitting,
    isDeleting,
    isExporting,
    refreshData,

    // Search & Filtering
    searchQuery,
    setSearchQuery,
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

    // Deletion Confirmation Dialog
    deleteTarget,
    isDeleteDialogOpen,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,

    // CSV Export
    handleExportCsv,
  } = useDataManagement();

  // Determine current active list count
  const currentList =
    activeTab === "departments"
      ? departments
      : activeTab === "positions"
      ? positions
      : leaders;

  const currentCount = pagination.total;

  const getEntityName = () => {
    switch (activeTab) {
      case "departments":
        return "department";
      case "positions":
        return "job position";
      case "leaders":
        return "leader";
      default:
        return "record";
    }
  };

  return (
    <PermissionGuard module="data_management">
      <div className="space-y-6">
        {/* Tier 1: Page Header with Breadcrumbs & Real-time Clock */}
        <PageHeader />

        {/* Tier 2: Module Command Header with Actions & CSV Export */}
        <DataManagementHeader
          activeTab={activeTab}
          onAdd={openAddDialog}
          onRefresh={refreshData}
          onExportCsv={handleExportCsv}
          loading={loading}
          isExporting={isExporting}
          totalCount={currentCount}
        />

        {/* Tier 3: Interactive KPI Metric Strip */}
        <DataManagementStatsCards
          stats={stats}
          loading={loadingStats}
          activeTab={activeTab}
          positionFilter={positionFilter}
          onKpiClick={handleKpiClick}
        />

        {/* Tier 4: Main Workspace Card */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Top Workspace Tab Selector */}
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full space-y-4"
            >
              {/* Inline Faceted Filter Bar */}
              <DataManagementFilterBar
                activeTab={activeTab}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                positionFilter={positionFilter}
                onPositionFilterChange={handlePositionFilterChange}
                onResetFilters={resetFilters}
                isFiltered={isFiltered}
                totalResults={currentCount}
              />

              {/* Workspace Content States */}
              {loading ? (
                <LoadingState
                  message={`Loading ${
                    activeTab === "departments"
                      ? "departments roster..."
                      : activeTab === "positions"
                      ? "positions directory..."
                      : "leadership personnel..."
                  }`}
                />
              ) : error ? (
                <ErrorState error={error} onRetry={refreshData} />
              ) : currentList.length === 0 ? (
                <EmptyState
                  activeTab={activeTab}
                  hasFilters={isFiltered}
                  onAdd={activeTab !== "leaders" ? openAddDialog : null}
                  onResetFilters={resetFilters}
                />
              ) : activeTab === "departments" ? (
                <DepartmentTable
                  departments={departments}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              ) : activeTab === "positions" ? (
                <PositionTable
                  positions={positions}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              ) : (
                <LeaderTable
                  leaders={leaders}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </Tabs>
          </CardContent>
        </Card>

        {/* Add / Edit Modal Dialog */}
        <DataManagementDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
          activeTab={activeTab}
          editItem={editingItem}
          onSave={handleSave}
          submitting={submitting}
        />

        {/* Standard Deletion Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog();
          }}
          onConfirm={confirmDelete}
          onConfirmDelete={confirmDelete}
          loading={isDeleting}
          itemName={deleteTarget?.name}
          itemType={getEntityName()}
          consequences={[
            `This ${getEntityName()} will be permanently removed from the master registry.`,
            "No active employees can be assigned to this record at the time of deletion.",
            "Historical attendance logs that reference this entity will remain intact.",
          ]}
        />
      </div>
    </PermissionGuard>
  );
}