"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Filter, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import AccountTable from "@/components/admin/accounts/AccountTable";
import AccountFormDialog from "@/components/admin/accounts/AccountFormDialog";
import FilterDialog from "@/components/admin/accounts/FilterDialog";
import DashboardStats from "@/components/admin/accounts/DashboardStats";
import { useAccountLogins } from "@/hooks/useAccountLogins";
import { ACCOUNT_ROLES } from "@/constants/accountConstants";
import PermissionGuard from "@/components/auth/PermissionGuard";
import PageHeader from "@/components/admin/layout/PageHeader";

export default function AccountLoginsPage() {
  // State management
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  
  // Custom hooks
  const { data: session } = useSession();
  const {
    accounts,
    loading,
    totalAccounts,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    pagination,
    setPagination,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  } = useAccountLogins();

  // Check if user can manage super admin accounts
  const canManageSuperAdmin = session?.user?.role === "superadmin";

  // Event handlers
  const handleOpenForm = (account = null) => {
    setCurrentAccount(account);
    setIsFormDialogOpen(true);
  };

  const handleAccountFormSubmit = async (formData) => {
    try {
      setIsFormDialogOpen(false);
      
      if (currentAccount) {
        await updateAccount(currentAccount.id, formData);
        toast.success("Account updated successfully");
      } else {
        await createAccount(formData);
        toast.success("Account created successfully");
      }
      
      setCurrentAccount(null);
    } catch (error) {
      console.error("Error submitting account data:", error);
      toast.error(error.message || "Failed to save account");
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await deleteAccount(id);
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.message || "Failed to delete account");
    }
  };

  const handleRefresh = () => {
    fetchAccounts();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <PermissionGuard module="account_logins">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Page Top Header with Breadcrumbs & Clock */}
        <PageHeader />

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Account Management Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Account Logins</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
              <Button 
                variant="outline"
                onClick={handleRefresh}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button onClick={() => handleOpenForm()}>
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              <AccountTable 
                accounts={accounts}
                totalAccounts={totalAccounts}
                pagination={pagination}
                setPagination={setPagination}
                onEdit={handleOpenForm}
                onDelete={handleDeleteAccount}
                session={session}
              />
            )}
          </CardContent>
        </Card>

        {/* Account Form Dialog */}
        <AccountFormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          account={currentAccount}
          onSubmit={handleAccountFormSubmit}
          availableRoles={ACCOUNT_ROLES.filter(role => 
            // Only super admin can create/edit super admin accounts
            role.id !== "superadmin" || canManageSuperAdmin
          )}
          canManageSuperAdmin={canManageSuperAdmin}
        />

        {/* Filter Dialog */}
        <FilterDialog
          open={isFilterDialogOpen}
          onOpenChange={setIsFilterDialogOpen}
          filters={filters}
          setFilters={setFilters}
          availableRoles={ACCOUNT_ROLES}
        />
      </div>
    </PermissionGuard>
  );
}