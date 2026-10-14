"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck } from "lucide-react";

/**
 * DataManagementDialog Component
 * Modern centered modal for adding and updating Departments and Positions.
 */
export default function DataManagementDialog({
  open,
  onOpenChange,
  activeTab = "departments",
  editItem = null,
  onSave,
  submitting = false,
}) {
  const isEditing = Boolean(editItem?.id);
  const isPosition = activeTab === "positions";
  const entityLabel = isPosition ? "Job Position" : "Department";

  const [name, setName] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (open) {
      if (editItem) {
        setName(editItem.name || "");
        setIsLeader(Boolean(editItem.is_leader));
      } else {
        setName("");
        setIsLeader(false);
      }
      setValidationError("");
    }
  }, [editItem, open]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError(`${entityLabel} name cannot be empty`);
      return;
    }

    if (trimmed.length > 255) {
      setValidationError(`${entityLabel} name cannot exceed 255 characters`);
      return;
    }

    setValidationError("");

    if (isPosition) {
      onSave({
        name: trimmed,
        is_leader: isLeader ? 1 : 0,
      });
    } else {
      onSave({
        name: trimmed,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {isEditing ? `Edit ${entityLabel}` : `Add New ${entityLabel}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEditing
                ? `Update the configuration details for this ${entityLabel.toLowerCase()}.`
                : `Enter the specifications for the new ${entityLabel.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="entity-name" className="text-xs font-medium">
                {entityLabel} Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="entity-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError("");
                }}
                placeholder={
                  isPosition
                    ? "e.g. Senior Embedded Engineer"
                    : "e.g. Engineering & IT"
                }
                className="h-9 text-xs"
                autoFocus
                disabled={submitting}
              />
              {validationError && (
                <p className="text-[11px] text-destructive font-medium mt-1">
                  {validationError}
                </p>
              )}
            </div>

            {/* Position-specific Leader Toggle */}
            {isPosition && (
              <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/80 bg-muted/20">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-purple-500" />
                    <Label
                      htmlFor="is-leader-switch"
                      className="text-xs font-medium cursor-pointer"
                    >
                      Leadership Role
                    </Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Employees holding this position can be designated as supervisors and will appear in the Leaders directory.
                  </p>
                </div>
                <Switch
                  id="is-leader-switch"
                  checked={isLeader}
                  onCheckedChange={setIsLeader}
                  disabled={submitting}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-8 text-xs border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !name.trim()}
              className="h-8 text-xs"
            >
              {submitting
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : `Create ${isPosition ? "Position" : "Department"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
