"use client";

import React, { memo } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MODULE_CATEGORIES } from "./constants";

/**
 * RolePermissionsFilterBar Component
 * Search and Category filtering toolbar for the permissions workspace.
 */
const RolePermissionsFilterBar = memo(function RolePermissionsFilterBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  activeRoleFilter,
  onClearRoleFilter,
  totalResults,
  totalModules
}) {
  const isFiltered = Boolean(searchQuery.trim() || categoryFilter !== "all" || activeRoleFilter);

  const handleReset = () => {
    onSearchChange("");
    onCategoryFilterChange("all");
    if (onClearRoleFilter) onClearRoleFilter(null);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Filter modules by name or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 pr-8 text-xs border-border/80 bg-background"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Categories & Filter Status */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category Filter Pills */}
        <div className="inline-flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
          {MODULE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryFilterChange(cat.value)}
              className={`h-7 px-2.5 text-xs font-medium rounded-md transition-colors ${
                categoryFilter === cat.value
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Clear Filters Reset */}
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="size-3" />
            Clear Filters
          </Button>
        )}

        <div className="text-xs text-muted-foreground font-mono pl-1 hidden sm:inline">
          {totalResults} of {totalModules} modules
        </div>
      </div>
    </div>
  );
});

export default RolePermissionsFilterBar;
