"use client";

import React, { memo, useState } from "react";
import { Search, X, RotateCcw, Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * AttendanceFilterBar Component
 * Inline faceted filter bar with search, department selector, shift status toggle,
 * and Popover Date Range Picker with quick preset shortcuts.
 */
const AttendanceFilterBar = memo(function AttendanceFilterBar({
  searchQuery = "",
  onSearchChange,
  filters = { logType: "ALL", department: "", startDate: "", endDate: "", datePreset: "all" },
  onFilterChange,
  onDatePreset,
  onCustomDateRange,
  onResetFilters,
  departments = [],
  loading = false,
  totalLogs = 0,
  currentLogsCount = 0,
  isFiltered = false,
}) {
  const hasSearch = searchQuery.trim().length > 0;
  const [localStartDate, setLocalStartDate] = useState(filters.startDate || "");
  const [localEndDate, setLocalEndDate] = useState(filters.endDate || "");
  const [popoverOpen, setPopoverOpen] = useState(false);

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

  const getDateLabel = () => {
    switch (filters.datePreset) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "week":
        return "Last 7 Days";
      case "month":
        return "This Month";
      case "custom":
        if (filters.startDate && filters.endDate) {
          return `${filters.startDate} to ${filters.endDate}`;
        }
        if (filters.startDate) return `From ${filters.startDate}`;
        if (filters.endDate) return `Until ${filters.endDate}`;
        return "Custom Range";
      default:
        return "All Dates";
    }
  };

  const handleApplyCustomDates = () => {
    onCustomDateRange(localStartDate, localEndDate);
    setPopoverOpen(false);
  };

  const handlePresetClick = (preset) => {
    onDatePreset(preset);
    setPopoverOpen(false);
  };

  const handleClearDate = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onDatePreset("all");
    setPopoverOpen(false);
  };

  return (
    <div className="space-y-2.5">
      {/* Primary Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search name or ASHIMA ID..."
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

        {/* Faceted Filter Selects & Date Popover */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <Select
            value={filters.department || "All Departments"}
            onValueChange={(val) =>
              onFilterChange(
                "department",
                val === "All Departments" ? "" : val
              )
            }
            disabled={loading}
          >
            <SelectTrigger
              className="h-8 text-xs px-2.5 min-w-[140px] border-border/80 bg-background"
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

          {/* Shift / Log Status Filter */}
          <Select
            value={filters.logType || "ALL"}
            onValueChange={(val) => onFilterChange("logType", val)}
            disabled={loading}
          >
            <SelectTrigger
              className="h-8 text-xs px-2.5 min-w-[130px] border-border/80 bg-background"
              aria-label="Filter by punch status"
            >
              <SelectValue placeholder="All Shifts" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="ALL">All Shifts</SelectItem>
              <SelectItem value="IN">On-Premise (In)</SelectItem>
              <SelectItem value="OUT">Completed (Out)</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Popover */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-xs px-2.5 border-border/80 bg-background gap-1.5",
                    filters.datePreset !== "all" && "border-foreground/30 font-medium"
                  )}
                  aria-label="Filter by date range"
                />
              }
            >
              <CalendarIcon className="size-3.5 text-muted-foreground" />
              <span>{getDateLabel()}</span>
              <ChevronDown className="size-3 text-muted-foreground opacity-60" />
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3 space-y-3 bg-card border-border shadow-md" align="end">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">Date Range Shortcuts</p>
                <p className="text-[11px] text-muted-foreground">Select a fast preset or custom date range</p>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "today", label: "Today" },
                  { id: "yesterday", label: "Yesterday" },
                  { id: "week", label: "Last 7 Days" },
                  { id: "month", label: "This Month" },
                ].map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    variant={filters.datePreset === item.id ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 text-xs justify-between px-2 font-normal"
                    onClick={() => handlePresetClick(item.id)}
                  >
                    <span>{item.label}</span>
                    {filters.datePreset === item.id && <Check className="size-3 text-primary" />}
                  </Button>
                ))}
              </div>

              <div className="pt-2 border-t border-border/60 space-y-2">
                <p className="text-[11px] font-medium text-muted-foreground">Custom Date Range</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground w-10">Start:</span>
                    <Input
                      type="date"
                      value={localStartDate}
                      onChange={(e) => setLocalStartDate(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground w-10">End:</span>
                    <Input
                      type="date"
                      value={localEndDate}
                      onChange={(e) => setLocalEndDate(e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground px-2"
                    onClick={handleClearDate}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={handleApplyCustomDates}
                  >
                    Apply Range
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              aria-label="Reset all filters"
            >
              <RotateCcw className="size-3" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Badges & Results Counter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {hasSearch && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 pl-2 pr-1 text-[11px] font-normal"
            >
              <span>Query: &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:bg-muted rounded-xs p-0.5"
                aria-label="Remove search filter"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {Boolean(filters.department) && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 pl-2 pr-1 text-[11px] font-normal"
            >
              <span>Dept: {getDepartmentName(filters.department)}</span>
              <button
                type="button"
                onClick={() => onFilterChange("department", "")}
                className="hover:bg-muted rounded-xs p-0.5"
                aria-label="Remove department filter"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {filters.logType !== "ALL" && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 pl-2 pr-1 text-[11px] font-normal"
            >
              <span>Shift: {filters.logType === "IN" ? "On-Premise" : "Completed"}</span>
              <button
                type="button"
                onClick={() => onFilterChange("logType", "ALL")}
                className="hover:bg-muted rounded-xs p-0.5"
                aria-label="Remove status filter"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {filters.datePreset !== "all" && (
            <Badge
              variant="secondary"
              className="h-6 gap-1 pl-2 pr-1 text-[11px] font-normal"
            >
              <span>Date: {getDateLabel()}</span>
              <button
                type="button"
                onClick={() => onDatePreset("all")}
                className="hover:bg-muted rounded-xs p-0.5"
                aria-label="Remove date filter"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="text-[11px] text-muted-foreground font-mono">
          Showing <span className="font-semibold text-foreground">{currentLogsCount}</span> of{" "}
          <span className="font-semibold text-foreground">{totalLogs.toLocaleString()}</span> logs
        </div>
      </div>
    </div>
  );
});

export default AttendanceFilterBar;
