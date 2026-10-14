"use client";

import React from "react";
import PermissionGuard from "@/components/auth/PermissionGuard";
import PageHeader from "@/components/admin/layout/PageHeader";
import AttendanceLogsHeader from "@/components/admin/attendance/AttendanceLogsHeader";
import AttendanceStatsCards from "@/components/admin/attendance/AttendanceStatsCards";
import AttendanceFilterBar from "@/components/admin/attendance/AttendanceFilterBar";
import AttendanceTable from "@/components/admin/attendance/AttendanceTable";
import AttendanceDetailSheet from "@/components/admin/attendance/AttendanceDetailSheet";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/admin/attendance/AttendanceStates";
import { Card, CardContent } from "@/components/ui/card";
import { useAttendanceLogsManager } from "@/hooks/useAttendanceLogsManager";

/**
 * AttendanceLogsPage Component
 * Redesigned 4-Tier Command Hub for RFID kiosk attendance swipe logs,
 * real-time shift duration tracking, and hardware audit verification.
 */
export default function AttendanceLogsPage() {
  const {
    // Core data
    logs,
    totalLogs,
    stats,
    departments,

    // Loading & Error states
    loading,
    loadingStats,
    exporting,
    error,

    // Filters, Search & Pagination
    searchQuery,
    filters,
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

    // Slide-over Sheet
    selectedLog,
    isDetailOpen,
    setIsDetailOpen,
    openDetailSheet,
  } = useAttendanceLogsManager();

  return (
    <PermissionGuard module="attendance_logs">
      <div className="space-y-6">
        {/* Tier 1: Page Top Header with Breadcrumbs & Real-time Clock */}
        <PageHeader />

        {/* Tier 2: Module Command Header with Actions & Live Polling */}
        <AttendanceLogsHeader
          totalLogs={totalLogs}
          onRefresh={refreshLogs}
          loading={loading}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
          onExportCsv={handleExportCsv}
          isExporting={exporting}
        />

        {/* Tier 3: Interactive KPI Metric Strip */}
        <AttendanceStatsCards
          stats={stats}
          loading={loadingStats}
          activeLogType={filters.logType}
          activeDatePreset={filters.datePreset}
          onKpiClick={handleKpiClick}
        />

        {/* Tier 4: Main Workspace Card */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Inline Faceted Filter Bar with Date Range Shortcuts */}
            <AttendanceFilterBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onDatePreset={handleDatePreset}
              onCustomDateRange={handleCustomDateRange}
              onResetFilters={resetFilters}
              departments={departments}
              loading={loading}
              totalLogs={totalLogs}
              currentLogsCount={logs.length}
              isFiltered={isFiltered}
            />

            {/* Table or States */}
            {error && !loading ? (
              <ErrorState error={error} onRetry={refreshLogs} />
            ) : loading ? (
              <LoadingState />
            ) : logs.length === 0 ? (
              <EmptyState
                hasFilters={isFiltered}
                onResetFilters={resetFilters}
                onRefresh={refreshLogs}
              />
            ) : (
              <AttendanceTable
                logs={logs}
                totalLogs={totalLogs}
                pagination={pagination}
                setPagination={setPagination}
                onView={openDetailSheet}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>

        {/* Slide-over Sheet: Punch Session Verification & Hardware Audit */}
        <AttendanceDetailSheet
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          log={selectedLog}
        />
      </div>
    </PermissionGuard>
  );
}