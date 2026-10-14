import { z } from "zod";

/**
 * Employee Zod Validation Schemas
 */

export const employeeSchema = z.object({
  ashima_id: z
    .string({ required_error: "Employee ID is required" })
    .trim()
    .min(1, "Employee ID is required")
    .max(50, "Employee ID cannot exceed 50 characters")
    .regex(
      /^[A-Za-z0-9-_]+$/,
      "Employee ID can only contain letters, numbers, hyphens, and underscores"
    ),
  name: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  department_id: z.coerce.number().int().positive().nullable().optional(),
  position_id: z.coerce.number().int().positive().nullable().optional(),
  leader: z.coerce.number().int().positive().nullable().optional(),
  rfid_tag: z
    .string()
    .trim()
    .max(64, "RFID tag cannot exceed 64 characters")
    .nullable()
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  photo: z.string().nullable().optional(),
  emp_stat: z.enum(["regular", "probationary"]).default("regular"),
  status: z.enum(["active", "inactive", "resigned"]).default("active"),
  removePhoto: z.boolean().optional(),
});
