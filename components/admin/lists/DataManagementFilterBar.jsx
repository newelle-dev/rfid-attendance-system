"use client";

import React, { memo } from "react";
import { Search, X, RotateCcw, Filter } from "lucide-react";
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
 * DataManagementFilterBar Component
 * Minimalist faceted filter bar with search debouncing, position role selector, and reset action.
 */
const DataManagementFilterBar = memo(function DataManagementFilterBar({
  activeTab = "departments",
  searchQuery = "",
  onSearchChange,
  positionFilter = "all",
  onPositionFilterChange,
  onResetFilters,
  isFiltered = false,
  totalResults = 0,
}) {
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "departments":
        return "Search departments by name...";
      case "positions":
        return "Search job positions by title...";
      case "leaders":
        return "Search leaders by name or Ashima ID...";
      default:
        return "Search records...";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onSearchChange("");
      e.target.blur();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input & Role Filter */}
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getSearchPlaceholder()}
            className="pl-9 pr-8 h-9 text-xs bg-background border-border/80"
            aria-label="Filter records by search term"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-sm transition-colors"
              aria-label="Clear search input"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Position-specific Leader/Standard filter */}
        {activeTab === "positions" && (
          <div className="w-full sm:w-52">
            <Select
              value={positionFilter}
              onValueChange={onPositionFilterChange}
            >
              <SelectTrigger className="h-9 text-xs border-border/80 bg-background">
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="size-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Filter role type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Roles
                </SelectItem>
                <SelectItem value="leaders" className="text-xs">
                  Leadership Roles Only
                </SelectItem>
                <SelectItem value="standard" className="text-xs">
                  Standard Roles Only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active Filter Reset */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            aria-label="Reset all filters"
          >
            <RotateCcw className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Filtered Count Display */}
      {isFiltered && (
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {totalResults} {totalResults === 1 ? "match" : "matches"} found
        </span>
      )}
    </div>
  );
});

export default DataManagementFilterBar;
