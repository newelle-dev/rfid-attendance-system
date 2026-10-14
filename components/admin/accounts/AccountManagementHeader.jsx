"use client";

import React, { memo } from "react";
import { Plus, Download, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * AccountManagementHeader Component
 * Tier 2 Command Header with contextual action buttons, refresh, and CSV export.
 */
const AccountManagementHeader = memo(function AccountManagementHeader({
  onAdd,
  onRefresh,
  onExportCsv,
  loading = false,
  isExporting = false,
  totalCount = 0,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Account Logins
          </h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border/70 font-mono">
            <ShieldCheck className="size-3 text-muted-foreground" />
            {totalCount.toLocaleString()} Accounts
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Manage privileged administrative accounts, configure access roles, and audit security credentials
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Refresh account list"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={isExporting}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Export account directory to CSV"
        >
          <Download className="size-3.5" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>

        <Button
          size="sm"
          onClick={onAdd}
          className="h-8 text-xs gap-1.5"
          aria-label="Create new admin account"
        >
          <Plus className="size-3.5" />
          Add Account
        </Button>
      </div>
    </div>
  );
});

export default AccountManagementHeader;
