"use client";

import React from "react";
import PermissionGuard from "@/components/auth/PermissionGuard";
import PageHeader from "@/components/admin/layout/PageHeader";
import AccountManagementHeader from "@/components/admin/accounts/AccountManagementHeader";
import AccountStatsCards from "@/components/admin/accounts/AccountStatsCards";
import AccountFilterBar from "@/components/admin/accounts/AccountFilterBar";
import AccountTable from "@/components/admin/accounts/AccountTable";
import AccountFormDialog from "@/components/admin/accounts/AccountFormDialog";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/admin/accounts/AccountStates";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useAccountLogins } from "@/hooks/useAccountLogins";

/**
 * AccountLoginsPage Component
 * 4-Tier Command Hub for administrative credentials, role assignments,
 * privileged access management, and security audits.
 */
export default function AccountLoginsPage() {
  const {
    // Current Session & Authority
    session,
    canManageSuperAdmin,

    // Account Dataset & Status
    accounts,
    loading,
    error,
    refreshData,

    // KPI Metrics Strip
    stats,
    loadingStats,
    handleKpiClick,

    // Faceted Search & Filters
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

    // Add / Edit Account Modal
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
  } = useAccountLogins();

  const totalCount = pagination.total;

  return (
    <PermissionGuard module="account_logins">
      <div className="space-y-6">
        {/* Tier 1: Page Header with Breadcrumbs & Real-time Clock */}
        <PageHeader />

        {/* Tier 2: Module Command Header with Actions & CSV Export */}
        <AccountManagementHeader
          onAdd={openAddDialog}
          onRefresh={refreshData}
          onExportCsv={handleExportCsv}
          loading={loading}
          isExporting={isExporting}
          totalCount={totalCount}
        />

        {/* Tier 3: Interactive KPI Metric Strip */}
        <AccountStatsCards
          stats={stats}
          loading={loadingStats}
          roleFilter={roleFilter}
          onKpiClick={handleKpiClick}
        />

        {/* Tier 4: Main Workspace Card */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Inline Faceted Filter Bar */}
            <AccountFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              roleFilter={roleFilter}
              onRoleFilterChange={handleRoleFilterChange}
              onResetFilters={resetFilters}
              isFiltered={isFiltered}
              totalResults={totalCount}
            />

            {/* Workspace Content States */}
            {loading ? (
              <LoadingState message="Loading administrative accounts roster..." />
            ) : error ? (
              <ErrorState error={error} onRetry={refreshData} />
            ) : accounts.length === 0 ? (
              <EmptyState
                hasFilters={isFiltered}
                onAdd={openAddDialog}
                onResetFilters={resetFilters}
              />
            ) : (
              <AccountTable
                accounts={accounts}
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                session={session}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>

        {/* Add / Edit Account Modal Dialog */}
        <AccountFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            if (!open) closeFormDialog();
          }}
          mode={formMode}
          account={editingAccount}
          onSubmit={handleFormSubmit}
          submitting={submitting}
          canManageSuperAdmin={canManageSuperAdmin}
        />

        {/* Standard Deletion Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            if (!open) closeDeleteDialog();
          }}
          onConfirm={confirmDelete}
          onConfirmDelete={confirmDelete}
          loading={isDeleting}
          itemName={
            deletingAccount
              ? `${deletingAccount.name} (@${deletingAccount.username})`
              : "account"
          }
          itemType="admin account"
          consequences={[
            "The user will immediately lose access to the administrative control panel.",
            "All active login sessions for this account will be permanently revoked.",
            "Historical attendance punch logs and system audit records created by this user will remain intact.",
          ]}
        />
      </div>
    </PermissionGuard>
  );
}