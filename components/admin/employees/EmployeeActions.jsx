/**
 * Employee management header actions
 * Contains the primary action buttons for employee management
 */

import React, { memo } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

/**
 * EmployeeActions Component
 * @param {Object} props - Component props
 * @param {Function} props.onAddEmployee - Handler for adding new employee
 * @param {Function} props.onExportEmployees - Handler for exporting employees
 * @param {Function} props.onImportEmployees - Handler for importing employees
 * @param {boolean} props.loading - Loading state
 * @param {number} props.totalEmployees - Total number of employees
 */
const EmployeeActions = memo(({
  onAddEmployee,
  onExportEmployees,
  onImportEmployees,
  loading = false,
  totalEmployees = 0
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Export/Import Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              disabled={loading}
              aria-label="Export or import employee data"
            />
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Export/Import
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={onExportEmployees}
            disabled={loading || totalEmployees === 0}
            className="cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onImportEmployees}
            disabled={loading}
            className="cursor-pointer"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import from CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Employee Button */}
      <Button
        onClick={onAddEmployee}
        disabled={loading}
        aria-label="Add new employee"
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Employee
      </Button>
    </div>
  );
});

EmployeeActions.displayName = 'EmployeeActions';

export default EmployeeActions;
