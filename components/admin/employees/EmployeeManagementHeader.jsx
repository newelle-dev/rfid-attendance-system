"use client";

import React, { memo } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * EmployeeManagementHeader Component
 * Clean top title and action buttons for the employee management workspace.
 */
const EmployeeManagementHeader = memo(function EmployeeManagementHeader({
  onAddEmployee,
  onExportCsv,
  isExporting = false,
  totalEmployees = 0,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Employees Management
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Directory of personnel, RFID hardware credentials, and reporting lines
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={isExporting || totalEmployees === 0}
          className="h-8 text-xs border-border/80 gap-1.5"
          aria-label="Export employee roster to CSV"
        >
          <Download className="size-3.5" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>

        <Button
          size="sm"
          onClick={onAddEmployee}
          className="h-8 text-xs gap-1.5"
          aria-label="Add new employee"
        >
          <Plus className="size-3.5" />
          Add Employee
        </Button>
      </div>
    </div>
  );
});

export default EmployeeManagementHeader;
