import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAdminSession } from "@/lib/auth";
import { createAccountSchema } from "@/lib/validations/accounts";


/**
 * GET: List all admin accounts with faceted filtering, search, and pagination
 */
export async function GET(request) {
  const { error } = await requireAdminSession(["admin", "superadmin"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const offset = (page - 1) * limit;
    const role = searchParams.get("role")?.trim() || "";

    const conditions = [];
    const values = [];

    // Search condition across username, name, and employee Ashima ID
    if (search) {
      conditions.push("(u.name LIKE ? OR u.username LIKE ? OR u.employee_id LIKE ?)");
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Role filter
    if (role && role !== "all") {
      conditions.push("u.role = ?");
      values.push(role);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total records matching criteria
    const countQuery = `SELECT COUNT(*) as total FROM admin_users u ${whereClause}`;
    const countResult = await executeQuery({
      query: countQuery,
      values,
    });
    const total = Number(countResult[0]?.total || 0);

    // Fetch paginated accounts enriched with linked employee metadata
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
        e.id as linkedEmployeeId,
        e.name as employeeName,
        d.name as departmentName,
        p.name as positionName,
        e.status as employeeStatus
      FROM admin_users u
      LEFT JOIN employees e ON u.employee_id = e.ashima_id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      ${whereClause} 
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `;

    const accounts = await executeQuery({
      query,
      values: [...values, limit, offset],
    });

    const formattedAccounts = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      username: account.username,
      employeeId: account.employeeId,
      role: account.role,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      linkedEmployee: account.linkedEmployeeId
        ? {
            id: account.linkedEmployeeId,
            name: account.employeeName,
            department: account.departmentName || "Unassigned",
            position: account.positionName || "Staff",
            status: account.employeeStatus || "unknown",
          }
        : null,
    }));

    return NextResponse.json({
      data: formattedAccounts,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("Error fetching accounts:", err);
    return NextResponse.json(
      { error: "Failed to fetch admin accounts" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new admin account
 */
export async function POST(request) {
  const { error, user } = await requireAdminSession(["admin", "superadmin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { error: firstError, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, username, employeeId, password, role } = parsed.data;

    // Privilege escalation prevention: Only superadmin can create superadmin accounts
    if (role === "superadmin" && user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Only Super Administrators can create accounts with Super Admin privileges" },
        { status: 403 }
      );
    }

    // Check for duplicate username
    const existingUser = await executeQuery({
      query: "SELECT id FROM admin_users WHERE username = ? LIMIT 1",
      values: [username],
    });

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: `The username '${username}' is already in use. Please choose another.` },
        { status: 409 }
      );
    }

    // Check for duplicate employee ID
    const existingEmp = await executeQuery({
      query: "SELECT id FROM admin_users WHERE employee_id = ? LIMIT 1",
      values: [employeeId],
    });

    if (existingEmp.length > 0) {
      return NextResponse.json(
        { error: `An admin account is already linked to Ashima ID '${employeeId}'.` },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new account record
    const insertQuery = `
      INSERT INTO admin_users (name, username, employee_id, password, role) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await executeQuery({
      query: insertQuery,
      values: [name, username, employeeId, hashedPassword, role],
    });

    return NextResponse.json(
      {
        success: true,
        id: result.insertId,
        message: "Admin account created successfully",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating account:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Username or Ashima ID already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}