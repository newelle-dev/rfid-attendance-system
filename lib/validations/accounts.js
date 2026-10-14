import { z } from "zod";

/**
 * Admin User Account Zod Validation Schemas
 */

export const createAccountSchema = z.object({
  name: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain alphanumeric characters, dots, underscores, and hyphens"
    ),
  employeeId: z
    .string({ required_error: "Ashima ID is required" })
    .trim()
    .min(1, "Ashima ID is required")
    .max(50, "Ashima ID cannot exceed 50 characters"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  role: z.enum(["superadmin", "admin", "security", "hr"], {
    errorMap: () => ({
      message: "Valid role is required (superadmin, admin, security, hr)",
    }),
  }),
});

export const updateAccountSchema = z.object({
  name: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  role: z.enum(["superadmin", "admin", "security", "hr"], {
    errorMap: () => ({
      message: "Valid role is required (superadmin, admin, security, hr)",
    }),
  }),
  employeeId: z
    .string()
    .trim()
    .min(1, "Ashima ID cannot be empty")
    .max(50, "Ashima ID cannot exceed 50 characters")
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});
