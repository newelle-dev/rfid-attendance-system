"use client";

import React, { useMemo } from "react";
import PermissionGuard from "@/components/auth/PermissionGuard";
import PageHeader from "@/components/admin/layout/PageHeader";
import EmployeeManagementHeader from "@/components/admin/employees/EmployeeManagementHeader";
import EmployeeStatsCards from "@/components/admin/employees/EmployeeStatsCards";
import EmployeeFilterBar from "@/components/admin/employees/EmployeeFilterBar";
import EmployeeTable from "@/components/admin/employees/EmployeeTable";
import EmployeeDossierSheet from "@/components/admin/employees/EmployeeDossierSheet";
import EmployeeFormSheet from "@/components/admin/employees/EmployeeFormSheet";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/admin/employees/EmployeeStates";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useEmployeesManager } from "@/hooks/useEmployeesManager";

/**
 * EmployeesManagementPage Component
 * Redesigned Command Hub for employee records, live RFID ID preview, and personnel management.
 */
export default function EmployeesManagementPage() {
  const {
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
    submitting,
    isDeleting,
    isExporting,
    error,

    // Filters & Pagination
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
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
  } = useEmployeesManager();

  const isFiltered = useMemo(() => {
    return (
      Boolean(searchQuery.trim()) ||
      Boolean(filters.department) ||
      Boolean(filters.position) ||
      Boolean(filters.status) ||
      Boolean(filters.leader)
    );
  }, [searchQuery, filters]);

  return (
    <PermissionGuard module="employees_management">
      <div className="space-y-6">
        {/* Top Header with Breadcrumbs & Clock */}
        <PageHeader />

        {/* Page Title & Primary Actions */}
        <EmployeeManagementHeader
          onAddEmployee={openCreateForm}
          onExportCsv={handleExportCsv}
          isExporting={isExporting}
          totalEmployees={totalEmployees}
        />

        {/* KPI Metric Strip with Interactive Click-to-Filter */}
        <EmployeeStatsCards
          stats={stats}
          loading={loadingStats}
          activeStatusFilter={filters.status}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {/* Main Employee Workspace Card */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Inline Faceted Filter Bar */}
            <EmployeeFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={resetFilters}
              onRefresh={refreshEmployees}
              departments={departments}
              positions={positions}
              loading={loading}
              totalEmployees={totalEmployees}
            />

            {/* Table or States */}
            {error && !loading ? (
              <ErrorState error={error} onRetry={refreshEmployees} />
            ) : loading ? (
              <LoadingState />
            ) : employees.length === 0 ? (
              <EmptyState
                hasFilters={isFiltered}
                onAddEmployee={openCreateForm}
                onResetFilters={resetFilters}
              />
            ) : (
              <EmployeeTable
                employees={employees}
                totalEmployees={totalEmployees}
                pagination={pagination}
                setPagination={setPagination}
                onView={openDossier}
                onEdit={openEditForm}
                onDelete={openDeleteDialog}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>

        {/* Slide-over Sheet: Read-Only Dossier */}
        <EmployeeDossierSheet
          open={isDossierOpen}
          onOpenChange={setIsDossierOpen}
          employee={selectedEmployee}
          onEdit={openEditForm}
          onDelete={openDeleteDialog}
        />

        {/* Slide-over Sheet: Create / Edit Form */}
        <EmployeeFormSheet
          open={isFormSheetOpen}
          onOpenChange={setIsFormSheetOpen}
          employee={selectedEmployee}
          departments={departments}
          positions={positions}
          leaders={leaders}
          onSubmit={handleEmployeeSubmit}
          isSubmitting={submitting}
        />

        {/* Standard Deletion Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDelete}
          onConfirmDelete={confirmDelete}
          loading={isDeleting}
          itemName={deleteTarget?.name}
          itemType="employee"
          consequences={[
            "RFID hardware credentials will be immediately unassigned.",
            "The employee will no longer be able to punch at RFID kiosk terminals.",
            "Existing attendance logs will remain preserved in historical records.",
          ]}
        />
      </div>
    </PermissionGuard>
  );
}