"use client";

import AttendanceTable from "@/components/admin/attendance/AttendanceTable";
import FilterDialog from "@/components/admin/attendance/FilterDialog";
import DashboardStats from "@/components/admin/attendance/DashboardStats";
import AttendanceHeader from "@/components/admin/attendance/AttendanceHeader";
import AttendanceStates from "@/components/admin/attendance/AttendanceStates";
import PermissionGuard from "@/components/auth/PermissionGuard";
import PageHeader from "@/components/admin/layout/PageHeader";
import { useAttendanceLogsManager } from "@/hooks/useAttendanceLogsManager";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Attendance Logs Page Component
 * Provides a comprehensive view of attendance logs with search, filtering, and export capabilities
 * 
 * Features:
 * - Dashboard statistics overview
 * - Real-time search with debouncing
 * - Advanced filtering by log type, department, and date range
 * - CSV export functionality
 * - Paginated table view
 * - Accessible UI with ARIA labels and keyboard navigation
 */
export default function AttendanceLogsPage() {
  const {
    // Data state
    logs,
    totalLogs,
    departments,
    
    // Loading states
    loading,
    loadingDepartments,
    exporting,
    
    // Filter and search state
    searchQuery,
    filters,
    setFilters,
    pagination,
    setPagination,
    
    // Dialog state
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    
    // Error state
    error,
    
    // Computed values
    computedValues,
    
    // Actions
    handleSearchChange,
    handleExportLogs,
    openFilterDialog,
    resetFilters,
    refreshLogs,
  } = useAttendanceLogsManager();

  return (
    <PermissionGuard module="attendance_logs">
      <div 
        className="container mx-auto px-4 py-8 space-y-6"
        role="main"
        aria-label="Attendance Logs Management"
      >
        {/* Page Top Header with Breadcrumbs & Clock */}
        <PageHeader />

        {/* Dashboard Statistics */}
        <DashboardStats />

        {/* Main Attendance Logs Card */}
        <Card>
          <AttendanceHeader 
            onFilterClick={openFilterDialog}
            onExportClick={handleExportLogs}
            onSearchChange={handleSearchChange}
            exporting={exporting}
            hasActiveFilters={computedValues.hasActiveFilters}
            onResetFilters={resetFilters}
          />
          
          <CardContent>
            <AttendanceStates 
              loading={loading}
              error={error}
              showEmptyState={computedValues.showEmptyState}
              hasFiltersOrSearch={computedValues.hasFiltersOrSearch}
              onRefresh={refreshLogs}
              onResetFilters={resetFilters}
            />
            
            {!loading && !error && logs.length > 0 && (
              <AttendanceTable
                logs={logs}
                totalLogs={totalLogs}
                pagination={pagination}
                setPagination={setPagination}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>

        {/* Filter Dialog */}
        <FilterDialog
          open={isFilterDialogOpen}
          onOpenChange={setIsFilterDialogOpen}
          filters={filters}
          setFilters={setFilters}
          departments={departments}
          loadingDepartments={loadingDepartments}
        />
      </div>
    </PermissionGuard>
  );
}