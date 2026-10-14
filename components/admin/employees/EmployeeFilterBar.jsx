"use client";

import React, { memo } from "react";
import { Search, X, RotateCcw, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * EmployeeFilterBar Component
 * Minimalist inline faceted filter bar for employee management.
 */
const EmployeeFilterBar = memo(function EmployeeFilterBar({
  searchQuery = "",
  onSearchChange,
  filters = { department: "", position: "", status: "", leader: "" },
  onFilterChange,
  onResetFilters,
  onRefresh,
  departments = [],
  positions = [],
  loading = false,
  totalEmployees = 0,
}) {
  const hasSearch = searchQuery.trim().length > 0;
  const hasActiveFilters =
    Boolean(filters.department) ||
    Boolean(filters.position) ||
    Boolean(filters.status) ||
    Boolean(filters.leader);
  const isFiltered = hasSearch || hasActiveFilters;

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onSearchChange("");
      e.target.blur();
    }
  };

  const getDepartmentName = (id) => {
    const found = departments.find((d) => String(d.id) === String(id));
    return found ? found.name : id;
  };

  const getPositionName = (id) => {
    const found = positions.find((p) => String(p.id) === String(id));
    return found ? found.name : id;
  };

  return (
    <div className="space-y-2.5">
      {/* Primary Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search name, ID, or RFID..."
            className="h-8 pl-8 pr-7 text-xs bg-background border-border/80 rounded-md focus-visible:ring-1 focus-visible:ring-foreground/20"
            disabled={loading}
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Faceted Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <Select
            value={filters.department || "All Departments"}
            onValueChange={(val) =>
              onFilterChange({  
                ...filters,
                department: val === "All Departments" ? "" : val,
              })
            }
            disabled={loading}
          >
            <SelectTrigger
              className="h-8 text-xs px-2.5 min-w-[130px] border-border/80 bg-background"
              aria-label="Filter by department"
            >
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="All Departments">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Position Filter */}
          <Select
            value={filters.position || "All Positions"}
            onValueChange={(val) =>
              onFilterChange({
                ...filters,
                position: val === "All Positions" ? "" : val,
              })
            }
            disabled={loading}
          >
            <SelectTrigger
              className="h-8 text-xs px-2.5 min-w-[120px] border-border/80 bg-background"
              aria-label="Filter by position"
            >
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="All Positions">All Positions</SelectItem>
              {positions.map((pos) => (
                <SelectItem key={pos.id} value={String(pos.id)}>
                  {pos.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || "All Statuses"}
            onValueChange={(val) =>
              onFilterChange({
                ...filters,
                status: val === "All Statuses" ? "" : val,
              })
            }
            disabled={loading}
          >
            <SelectTrigger
              className="h-8 text-xs px-2.5 min-w-[110px] border-border/80 bg-background"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Resigned">Resigned</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 px-2 border-border/80"
            aria-label="Refresh employees list"
          >
            <RefreshCw
              className={`size-3.5 ${loading ? "animate-spin text-muted-foreground" : ""}`}
            />
          </Button>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              disabled={loading}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Reset all filters"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">
            Active filters:
          </span>

          {hasSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-[11px] text-foreground">
              Search: <span className="font-mono font-medium">{searchQuery}</span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove search filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {filters.department && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-[11px] text-foreground">
              Dept: <span className="font-medium">{getDepartmentName(filters.department)}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, department: "" })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove department filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {filters.position && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-[11px] text-foreground">
              Role: <span className="font-medium">{getPositionName(filters.position)}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, position: "" })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove position filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-[11px] text-foreground capitalize">
              Status: <span className="font-medium">{filters.status}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, status: "" })}
                className="hover:text-destructive transition-colors ml-0.5"
                aria-label="Remove status filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
          >
            Clear all ({totalEmployees} results)
          </button>
        </div>
      )}
    </div>
  );
});

export default EmployeeFilterBar;
