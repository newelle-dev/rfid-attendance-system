"use client";

import React, { memo, useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  X,
  CreditCard,
  Building2,
  Briefcase,
  Users,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { employeeSchema } from "@/lib/validations/employees";

/**
 * EmployeeFormSheet Component
 * Slide-over sheet for Creating or Editing an employee record with real-time digital ID preview.
 */
const EmployeeFormSheet = memo(function EmployeeFormSheet({
  open = false,
  onOpenChange,
  employee = null,
  departments = [],
  positions = [],
  leaders = [],
  onSubmit,
  isSubmitting = false,
}) {
  const isEditing = Boolean(employee);

  // Form local state
  const [formData, setFormData] = useState({
    ashima_id: "",
    name: "",
    department_id: "",
    position_id: "",
    leader: "",
    emp_stat: "regular",
    status: "active",
    rfid_tag: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync form when employee prop or open changes
  useEffect(() => {
    if (open) {
      if (employee) {
        setFormData({
          ashima_id: employee.ashima_id || "",
          name: employee.name || "",
          department_id: employee.department_id ? String(employee.department_id) : "",
          position_id: employee.position_id ? String(employee.position_id) : "",
          leader: employee.leader ? String(employee.leader) : "",
          emp_stat: employee.emp_stat || "regular",
          status: employee.status || "active",
          rfid_tag: employee.rfid_tag || "",
        });
        setPhotoPreview(employee.photo || null);
      } else {
        setFormData({
          ashima_id: "",
          name: "",
          department_id: "",
          position_id: "",
          leader: "",
          emp_stat: "regular",
          status: "active",
          rfid_tag: "",
        });
        setPhotoPreview(null);
      }
      setErrors({});
    }
  }, [open, employee]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // If setting to resigned, clear rfid tag
      if (field === "status" && value === "resigned") {
        updated.rfid_tag = "";
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file size must be less than 3MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const validate = () => {
    const dataToValidate = {
      ...formData,
      department_id: formData.department_id ? Number(formData.department_id) : null,
      position_id: formData.position_id ? Number(formData.position_id) : null,
      leader: formData.leader ? Number(formData.leader) : null,
      rfid_tag: formData.status === "resigned" ? null : formData.rfid_tag?.trim() || null,
      photo: photoPreview,
      removePhoto: formData.status === "resigned" || !photoPreview,
    };

    const parsed = employeeSchema.safeParse(dataToValidate);

    if (!parsed.success) {
      const fieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      const firstErrorMessage = parsed.error.issues[0]?.message || "Please fix the errors in the form";
      toast.error(firstErrorMessage);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const payload = {
      ...formData,
      department_id: formData.department_id ? Number(formData.department_id) : null,
      position_id: formData.position_id ? Number(formData.position_id) : null,
      leader: formData.leader ? Number(formData.leader) : null,
      rfid_tag: formData.status === "resigned" ? null : formData.rfid_tag.trim() || null,
      removePhoto: formData.status === "resigned" || !photoPreview,
    };

    const finalPhoto = formData.status === "resigned" ? null : photoPreview;
    await onSubmit(payload, finalPhoto);
  };

  // Derived helper for live badge
  const selectedDepartment = departments.find(
    (d) => String(d.id) === String(formData.department_id)
  )?.name;
  const selectedPosition = positions.find(
    (p) => String(p.id) === String(formData.position_id)
  )?.name;

  // Memoized dropdown item collections for Base UI Select
  const departmentItems = useMemo(
    () => [
      { value: "none", label: "None / Unassigned" },
      ...departments.map((dept) => ({
        value: String(dept.id),
        label: dept.name,
      })),
    ],
    [departments]
  );

  const positionItems = useMemo(
    () => [
      { value: "none", label: "None / Unassigned" },
      ...positions.map((pos) => ({
        value: String(pos.id),
        label: pos.name,
      })),
    ],
    [positions]
  );

  const leaderItems = useMemo(
    () => [
      { value: "none", label: "Direct / None" },
      ...leaders.map((lead) => ({
        value: String(lead.id),
        label: lead.name,
      })),
    ],
    [leaders]
  );

  const employmentTypeItems = useMemo(
    () => [
      { value: "regular", label: "Regular" },
      { value: "contractual", label: "Contractual" },
      { value: "probationary", label: "Probationary" },
    ],
    []
  );

  const statusItems = useMemo(
    () => [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "resigned", label: "Resigned" },
    ],
    []
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl flex flex-col p-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <SheetTitle className="text-base font-semibold">
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {isEditing
              ? "Update personnel information and RFID credentials"
              : "Register a new employee into the RFID attendance directory"}
          </SheetDescription>
        </SheetHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1 px-6 py-5 space-y-6">
            {/* Live Visual ID Badge Card */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Live Credential Preview
                </span>
                <span
                  className={cn(
                    "size-2 rounded-full",
                    formData.status === "active"
                      ? "bg-emerald-500"
                      : formData.status === "inactive"
                      ? "bg-amber-500"
                      : "bg-zinc-400"
                  )}
                />
              </div>

              <div className="flex items-center gap-3.5">
                <Avatar className="size-14 rounded-lg border border-border shrink-0">
                  {photoPreview ? (
                    <AvatarImage
                      src={photoPreview}
                      alt="Preview"
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg bg-muted text-sm font-semibold">
                    {formData.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-foreground truncate">
                    {formData.name || "Employee Name"}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedPosition || "No Position Selected"}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border text-foreground">
                      {formData.ashima_id || "ID-XXXX"}
                    </span>
                    {selectedDepartment && (
                      <span className="text-[11px] text-muted-foreground truncate">
                        {selectedDepartment}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="size-3" />
                  RFID UID:
                </span>
                <span className="font-mono text-[11px] font-medium text-foreground">
                  {formData.rfid_tag || "Unassigned"}
                </span>
              </div>
            </div>

            {/* Section 1: Personnel & Role */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <Briefcase className="size-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Personnel & Role Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Employee ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="ashima_id" className="text-xs font-medium">
                    Employee ID (Ashima ID) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ashima_id"
                    value={formData.ashima_id}
                    onChange={(e) => handleChange("ashima_id", e.target.value)}
                    disabled={isEditing || isSubmitting}
                    placeholder="e.g. EMP-1001"
                    className={cn(
                      "h-8 text-xs font-mono bg-background border-border/80",
                      errors.ashima_id && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.ashima_id && (
                    <p className="text-[11px] text-destructive">{errors.ashima_id}</p>
                  )}
                  {isEditing && (
                    <p className="text-[10px] text-muted-foreground">
                      Employee ID cannot be modified after creation
                    </p>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. John Doe"
                    className={cn(
                      "h-8 text-xs bg-background border-border/80",
                      errors.name && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-destructive">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Department */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Department</Label>
                  <Select
                    items={departmentItems}
                    value={formData.department_id || "none"}
                    onValueChange={(val) =>
                      handleChange("department_id", val === "none" ? "" : val)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-border/80 w-full">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {departmentItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Position</Label>
                  <Select
                    items={positionItems}
                    value={formData.position_id || "none"}
                    onValueChange={(val) =>
                      handleChange("position_id", val === "none" ? "" : val)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-border/80 w-full">
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {positionItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Reports To (Leader) */}
                <div className="space-y-1.5 sm:col-span-1">
                  <Label className="text-xs font-medium">Reports To</Label>
                  <Select
                    items={leaderItems}
                    value={formData.leader || "none"}
                    onValueChange={(val) =>
                      handleChange("leader", val === "none" ? "" : val)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-border/80 w-full">
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {leaderItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Employment Type</Label>
                  <Select
                    items={employmentTypeItems}
                    value={formData.emp_stat}
                    onValueChange={(val) => handleChange("emp_stat", val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-border/80 w-full">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {employmentTypeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Status */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Account Status</Label>
                  <Select
                    items={statusItems}
                    value={formData.status}
                    onValueChange={(val) => handleChange("status", val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-border/80 w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {statusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: RFID Hardware Credential */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <CreditCard className="size-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  RFID Hardware Credential
                </h4>
              </div>

              {formData.status === "resigned" ? (
                <div className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-muted/40 text-xs text-muted-foreground">
                  <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    RFID card credential is decommissioned and cannot be assigned to
                    resigned personnel.
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="rfid_tag" className="text-xs font-medium">
                    Card UID / RFID Tag
                  </Label>
                  <Input
                    id="rfid_tag"
                    value={formData.rfid_tag}
                    onChange={(e) => handleChange("rfid_tag", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g. 0012938475"
                    className="h-8 text-xs font-mono bg-background border-border/80"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Can be typed manually or captured directly from a USB RFID card reader.
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Photo Upload */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                <Upload className="size-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Profile Photo
                </h4>
              </div>

              {formData.status === "resigned" ? (
                <p className="text-xs text-muted-foreground">
                  Photo is removed for archived resigned personnel.
                </p>
              ) : (
                <div className="space-y-3">
                  {photoPreview ? (
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/20">
                      <Avatar className="size-14 rounded-lg border border-border shrink-0">
                        <AvatarImage
                          src={photoPreview}
                          alt="Preview"
                          className="object-cover"
                        />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">
                          Photo uploaded
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Ready for badge synchronization
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPhotoPreview(null)}
                        className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                        disabled={isSubmitting}
                      >
                        <X className="size-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "flex flex-col items-center justify-center p-5 rounded-lg border-2 border-dashed transition-colors text-center cursor-pointer",
                        isDragOver
                          ? "border-foreground/50 bg-muted/40"
                          : "border-border/80 hover:bg-muted/20"
                      )}
                      onClick={() => document.getElementById("photo-file-input")?.click()}
                    >
                      <Upload className="size-6 text-muted-foreground mb-1.5" />
                      <p className="text-xs font-medium text-foreground">
                        Click or drag image to upload
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        PNG, JPG, or WebP up to 3MB
                      </p>
                      <input
                        id="photo-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Action Footer */}
          <div className="p-4 border-t border-border bg-background mt-auto flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs h-8 px-3 border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs h-8 px-4 gap-1.5"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Employee"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
});

export default EmployeeFormSheet;
