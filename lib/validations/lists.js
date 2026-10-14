import { z } from "zod";

/**
 * Department & Job Position Zod Validation Schemas
 */

export const departmentSchema = z.object({
  name: z
    .string({ required_error: "Department name is required" })
    .trim()
    .min(1, "Department name is required and cannot be empty")
    .max(255, "Department name cannot exceed 255 characters"),
});

export const positionSchema = z.object({
  name: z
    .string({ required_error: "Position name is required" })
    .trim()
    .min(1, "Position name is required and cannot be empty")
    .max(255, "Position name cannot exceed 255 characters"),
  is_leader: z.union([z.boolean(), z.number()]).optional().default(false),
});
