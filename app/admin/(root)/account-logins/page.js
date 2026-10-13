"use client";

import { useState } from "react";
import { useSnackbar } from "notistack";
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

export default function AccountLoginsPage() {
  // State management
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  
  // Custom hooks
  const { enqueueSnackbar } = useSnackbar();
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
        enqueueSnackbar("Account updated successfully", { variant: "success" });
      } else {
        await createAccount(formData);
        enqueueSnackbar("Account created successfully", { variant: "success" });
      }
      
      setCurrentAccount(null);
    } catch (error) {
      console.error("Error submitting account data:", error);
      enqueueSnackbar(error.message || "Failed to save account", { variant: "error" });
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await deleteAccount(id);
      enqueueSnackbar("Account deleted successfully", { variant: "success" });
    } catch (error) {
      console.error("Error deleting account:", error);
      enqueueSnackbar(error.message || "Failed to delete account", { variant: "error" });
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
      <div className="container mx-auto px-4 py-8">
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