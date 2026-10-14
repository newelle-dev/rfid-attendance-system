"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  User,
  Search,
  Check,
  IdCard,
  Lock,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCOUNT_ROLES, getRoleMeta } from "@/constants/accountConstants";
import { createAccountSchema, updateAccountSchema } from "@/lib/validations/accounts";


/**
 * AccountFormDialog Component
 * Centered modal dialog for creating and modifying administrative user accounts.
 * Features a searchable employee directory combobox, auto-filled identity fields,
 * role permission cards, and password security controls.
 */
export default function AccountFormDialog({
  open = false,
  onOpenChange,
  mode = "create",
  account = null,
  onSubmit,
  submitting = false,
  canManageSuperAdmin = false,
}) {
  const isEditing = mode === "edit";

  // Form field state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Employee picker state
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [manualAshimaEntry, setManualAshimaEntry] = useState(false);

  // Filter available roles based on current user privileges
  const availableRoles = useMemo(() => {
    return ACCOUNT_ROLES.filter((r) => r.id !== "superadmin" || canManageSuperAdmin);
  }, [canManageSuperAdmin]);

  // Reset or populate fields when modal opens or account changes
  useEffect(() => {
    if (open) {
      React.startTransition(() => {
        setErrors({});
        setShowPassword(false);
        setEmployeeSearch("");
        setIsEmployeeDropdownOpen(false);

        if (isEditing && account) {
          setName(account.name || "");
          setUsername(account.username || "");
          setEmployeeId(account.employeeId || "");
          setRole(account.role || "admin");
          setPassword("");
          setChangePassword(false);
          setManualAshimaEntry(true);
        } else {
          setName("");
          setUsername("");
          setEmployeeId("");
          setRole("admin");
          setPassword("");
          setChangePassword(true);
          setManualAshimaEntry(false);
        }
      });
    }
  }, [open, isEditing, account]);

  // Fetch active employee list when modal opens in create mode
  useEffect(() => {
    if (open && !isEditing) {
      let isMounted = true;
      const fetchAvailableEmployees = async () => {
        try {
          setLoadingEmployees(true);
          const res = await fetch("/api/admin/accounts/available-employees");
          if (!res.ok) throw new Error("Failed to load employees");
          const data = await res.json();
          if (isMounted) {
            setEmployees(data.data || []);
          }
        } catch (err) {
          console.error("Error loading employees for combobox:", err);
        } finally {
          if (isMounted) setLoadingEmployees(false);
        }
      };

      fetchAvailableEmployees();
      return () => {
        isMounted = false;
      };
    }
  }, [open, isEditing]);

  // Filter employees for searchable combobox
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const term = employeeSearch.toLowerCase().trim();
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(term) ||
        emp.ashimaId?.toLowerCase().includes(term) ||
        emp.department?.toLowerCase().includes(term)
    );
  }, [employees, employeeSearch]);

  // Handle employee selection from combobox
  const handleSelectEmployee = (emp) => {
    if (emp.isAssigned) return; // Prevent selecting already linked employees

    setEmployeeId(emp.ashimaId);
    setName(emp.name);

    // Auto-suggest clean username if currently empty
    if (!username.trim()) {
      const sanitized = emp.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .split(/\s+/)
        .join(".");
      setUsername(sanitized);
    }

    setIsEmployeeDropdownOpen(false);
    setEmployeeSearch("");
    setErrors((prev) => ({ ...prev, employeeId: null, name: null }));
  };

  // Validate form before submission using shared Zod schemas
  const validate = () => {
    const dataToValidate = isEditing
      ? {
          name: name.trim(),
          role,
          employeeId: employeeId.trim(),
          password: changePassword ? password : "",
        }
      : {
          name: name.trim(),
          username: username.trim(),
          employeeId: employeeId.trim(),
          password,
          role,
        };

    const schema = isEditing ? updateAccountSchema : createAccountSchema;
    const parsed = schema.safeParse(dataToValidate);

    if (!parsed.success) {
      const fieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: name.trim(),
      role,
    };

    if (!isEditing) {
      payload.username = username.trim();
      payload.employeeId = employeeId.trim();
      payload.password = password;
    } else {
      payload.employeeId = employeeId.trim();
      if (changePassword && password.trim()) {
        payload.password = password.trim();
      }
    }

    await onSubmit(payload);
  };

  const selectedRoleMeta = getRoleMeta(role);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/80">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <KeyRound className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                {isEditing ? "Edit Account Profile" : "Register Admin Account"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Update administrative credentials, role assignment, and security policies."
                  : "Create new credentials with dedicated system authority and audit privileges."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Section: Employee Linkage (Ashima ID) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <IdCard className="size-3.5 text-muted-foreground" />
                Employee Linkage (Ashima ID) *
              </Label>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setManualAshimaEntry(!manualAshimaEntry)}
                  className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  {manualAshimaEntry ? "Select from Employee Directory" : "Enter Ashima ID Manually"}
                </button>
              )}
            </div>

            {isEditing ? (
              // Locked in edit mode
              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/40 border border-border/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-foreground">{employeeId}</span>
                  {account?.linkedEmployee && (
                    <span className="text-muted-foreground text-[11px]">
                      ({account.linkedEmployee.department} • {account.linkedEmployee.position})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Lock className="size-3" />
                  <span>Linked</span>
                </div>
              </div>
            ) : manualAshimaEntry ? (
              // Manual input fallback
              <div>
                <Input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. ASH-00124"
                  className={cn(
                    "h-9 text-xs font-mono border-border/80",
                    errors.employeeId && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {errors.employeeId && (
                  <p className="text-[11px] text-destructive mt-1">{errors.employeeId}</p>
                )}
              </div>
            ) : (
              // Searchable Employee Combobox
              <div className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between w-full h-9 px-3 rounded-md border border-border/80 bg-background text-xs cursor-pointer hover:bg-muted/30 transition-colors",
                    errors.employeeId && "border-destructive"
                  )}
                >
                  {employeeId ? (
                    <span className="font-mono font-medium text-foreground">
                      {employeeId} — {name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {loadingEmployees ? "Loading employee roster..." : "Search and select employee..."}
                    </span>
                  )}
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </div>

                {errors.employeeId && (
                  <p className="text-[11px] text-destructive mt-1">{errors.employeeId}</p>
                )}

                {/* Combobox Dropdown Popover */}
                {isEmployeeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-border/80 bg-popover text-popover-foreground shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-border/80 bg-muted/20">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          placeholder="Search by name, ID, or department..."
                          className="h-8 pl-8 text-xs bg-background"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto divide-y divide-border/60">
                      {filteredEmployees.length === 0 ? (
                        <div className="py-6 text-center text-xs text-muted-foreground">
                          No active employees matching &quot;{employeeSearch}&quot;
                        </div>
                      ) : (
                        filteredEmployees.map((emp) => {
                          const isCurrent = employeeId === emp.ashimaId;
                          const isAssigned = emp.isAssigned;

                          return (
                            <button
                              key={emp.id}
                              type="button"
                              disabled={isAssigned}
                              onClick={() => handleSelectEmployee(emp)}
                              className={cn(
                                "flex items-center justify-between w-full p-2.5 text-left text-xs transition-colors",
                                isAssigned
                                  ? "opacity-50 cursor-not-allowed bg-muted/30"
                                  : "hover:bg-muted/50 cursor-pointer",
                                isCurrent && "bg-muted/70 font-medium"
                              )}
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-foreground">{emp.name}</span>
                                  <span className="font-mono text-[10px] text-muted-foreground">
                                    ({emp.ashimaId})
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                  {emp.department} • {emp.position}
                                </p>
                              </div>

                              <div>
                                {isAssigned ? (
                                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                    Account Exists
                                  </span>
                                ) : isCurrent ? (
                                  <Check className="size-4 text-primary" />
                                ) : null}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Identity Details (Full Name & Username) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                Full Name *
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className={cn(
                  "h-9 text-xs border-border/80",
                  errors.name && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-muted-foreground" />
                Username *
              </Label>
              <Input
                value={username}
                disabled={isEditing}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. eleanor.v"
                className={cn(
                  "h-9 text-xs font-mono border-border/80",
                  isEditing && "bg-muted/40 cursor-not-allowed",
                  errors.username && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.username && (
                <p className="text-[11px] text-destructive mt-1">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Section: Access Role Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-muted-foreground" />
              Access Role & Privileges *
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-9 text-xs border-border/80 bg-background">
                <div className="flex items-center gap-2">
                  <span
                    className={cn("size-2 rounded-full", selectedRoleMeta.dotClass)}
                    aria-hidden="true"
                  />
                  <SelectValue placeholder="Select system role" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", r.dotClass)} />
                      <span>{r.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Role Helper Preview Card */}
            <div className="p-2.5 rounded-md bg-muted/30 border border-border/70 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span className={cn("size-1.5 rounded-full", selectedRoleMeta.dotClass)} />
                <span>{selectedRoleMeta.name} Scope:</span>
              </div>
              <p className="text-muted-foreground pl-3">{selectedRoleMeta.description}</p>
            </div>
            {errors.role && (
              <p className="text-[11px] text-destructive mt-1">{errors.role}</p>
            )}
          </div>

          {/* Section: Password Security */}
          <div className="space-y-2 pt-1 border-t border-border/70">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={changePassword}
                      onChange={(e) => setChangePassword(e.target.checked)}
                      className="rounded border-border size-3.5 accent-primary cursor-pointer"
                    />
                    <span>Change Account Password</span>
                  </label>
                  {!changePassword && (
                    <span className="text-[11px] text-muted-foreground italic">
                      Current password retained
                    </span>
                  )}
                </div>

                {changePassword && (
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new 8+ character password"
                      className={cn(
                        "h-9 pr-9 text-xs border-border/80",
                        errors.password && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    {errors.password && (
                      <p className="text-[11px] text-destructive mt-1">{errors.password}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-muted-foreground" />
                    Account Password *
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Min. 8 characters</span>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure master password"
                    className={cn(
                      "h-9 pr-9 text-xs border-border/80",
                      errors.password && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/80 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs border-border/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="h-8 text-xs gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="size-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Account"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}