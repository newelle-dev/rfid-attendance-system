"use client";

import React, { memo } from "react";
import { Search, X, RotateCcw, Filter, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACCOUNT_ROLES } from "@/constants/accountConstants";

/**
 * AccountFilterBar Component
 * Inline faceted filter bar with search debouncing, role selector, and reset action.
 */
const AccountFilterBar = memo(function AccountFilterBar({
  searchQuery = "",
  onSearchChange,
  roleFilter = "all",
  onRoleFilterChange,
  onResetFilters,
  isFiltered = false,
  totalResults = 0,
}) {
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
            placeholder="Search by full name, username, or Ashima ID..."
            className="pl-9 pr-8 h-9 text-xs bg-background border-border/80"
            aria-label="Filter accounts by search term"
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

        {/* Role Filter Dropdown */}
        <div className="w-full sm:w-48">
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="h-9 text-xs border-border/80 bg-background">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Roles" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Access Roles
              </SelectItem>
              {ACCOUNT_ROLES.map((role) => (
                <SelectItem key={role.id} value={role.id} className="text-xs">
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 text-xs text-muted-foreground hover:text-foreground px-2.5"
            aria-label="Reset all search and filter conditions"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Roster Results Count */}
      <div className="flex items-center self-end sm:self-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Shield className="size-3.5 text-muted-foreground" />
          <span>
            {totalResults} {totalResults === 1 ? "account" : "accounts"} listed
          </span>
        </span>
      </div>
    </div>
  );
});

export default AccountFilterBar;
