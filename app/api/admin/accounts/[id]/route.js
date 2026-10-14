import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAdminSession } from "@/lib/auth";
import { z } from "zod";

const updateAccountSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["superadmin", "admin", "security", "hr"], {
    errorMap: () => ({ message: "Valid role is required (superadmin, admin, security, hr)" }),
  }),
  employeeId: z.string().trim().min(1, "Ashima ID cannot be empty").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

/**
 * GET: Fetch a single admin account by ID
 */
export async function GET(request, context) {
  const { error } = await requireAdminSession(["admin", "superadmin"]);
  if (error) return error;

  const { id } = await context.params;

  try {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.username, 
        u.employee_id as employeeId, 
        u.role, 
        u.last_login as lastLogin,
        u.created_at as createdAt, 
        u.updated_at as updatedAt,
        e.name as employeeName,
        d.name as departmentName,
        p.name as positionName
      FROM admin_users u
      LEFT JOIN employees e ON u.employee_id = e.ashima_id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE u.id = ?
      LIMIT 1
    `;

    const accounts = await executeQuery({
      query,
      values: [id],
    });

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const account = accounts[0];

    return NextResponse.json({
      id: account.id,
      name: account.name,
      username: account.username,
      employeeId: account.employeeId,
      role: account.role,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      linkedEmployee: account.employeeName
        ? {
            name: account.employeeName,
            department: account.departmentName,
            position: account.positionName,
          }
        : null,
    });
  } catch (err) {
    console.error("Error fetching account:", err);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update an existing admin account
 */
export async function PUT(request, context) {
  const { error, user } = await requireAdminSession(["admin", "superadmin"]);
  if (error) return error;

  const { id } = await context.params;

  try {
    // Verify target account exists
    const currentAccount = await executeQuery({
      query: "SELECT id, role, username, employee_id FROM admin_users WHERE id = ? LIMIT 1",
      values: [id],
    });

    if (!currentAccount || currentAccount.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const targetAccount = currentAccount[0];

    // Only superadmin can edit accounts that hold superadmin role
    if (targetAccount.role === "superadmin" && user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Only Super Administrators can modify Super Admin accounts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateAccountSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { error: firstError, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, role, employeeId, password } = parsed.data;

    // Prevent privilege escalation to superadmin by regular admins
    if (role === "superadmin" && user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Only Super Administrators can assign the Super Admin role" },
        { status: 403 }
      );
    }

    const updateFields = ["name = ?", "role = ?"];
    const values = [name, role];

    // If employee ID was provided and changed, verify uniqueness
    if (employeeId && employeeId !== targetAccount.employee_id) {
      const duplicateEmp = await executeQuery({
        query: "SELECT id FROM admin_users WHERE employee_id = ? AND id != ? LIMIT 1",
        values: [employeeId, id],
      });

      if (duplicateEmp.length > 0) {
        return NextResponse.json(
          { error: `Ashima ID '${employeeId}' is already assigned to another account.` },
          { status: 409 }
        );
      }

      updateFields.push("employee_id = ?");
      values.push(employeeId);
    }

    // Hash password if updating password
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.push("password = ?");
      values.push(hashedPassword);
    }

    values.push(id);

    const updateQuery = `
      UPDATE admin_users 
      SET ${updateFields.join(", ")} 
      WHERE id = ?
    `;

    await executeQuery({ query: updateQuery, values });

    return NextResponse.json({
      success: true,
      message: "Account updated successfully",
    });
  } catch (err) {
    console.error("Error updating account:", err);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove an admin account
 */
export async function DELETE(request, context) {
  const { error, user } = await requireAdminSession(["admin", "superadmin"]);
  if (error) return error;

  const { id } = await context.params;

  try {
    const targetQuery = `SELECT id, role, username FROM admin_users WHERE id = ? LIMIT 1`;
    const targetResult = await executeQuery({ query: targetQuery, values: [id] });

    if (!targetResult || targetResult.length === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const targetAccount = targetResult[0];

    // Self-deletion safeguard
    if (Number(user.id) === Number(id)) {
      return NextResponse.json(
        { error: "Security restriction: You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Superadmin deletion safeguard: only superadmin can delete superadmin
    if (targetAccount.role === "superadmin" && user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Security restriction: Only Super Administrators can delete Super Admin accounts." },
        { status: 403 }
      );
    }

    await executeQuery({
      query: "DELETE FROM admin_users WHERE id = ?",
      values: [id],
    });

    return NextResponse.json({
      success: true,
      message: `Account '${targetAccount.username}' deleted successfully`,
    });
  } catch (err) {
    console.error("Error deleting account:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}