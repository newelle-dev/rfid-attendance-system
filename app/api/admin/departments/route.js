import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { departmentSchema } from "@/lib/validations/lists";


// Get all departments with optional pagination, search, and assigned employee headcounts
export async function GET(request) {
  const { error } = await requireAdminSession(["admin", "hr"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const search = searchParams.get("search") || "";

    // Calculate offset
    const offset = (page - 1) * limit;

    let query, queryParams, countQuery, countParams;

    if (search) {
      query = `
        SELECT 
          d.id, 
          d.name,
          COUNT(e.id) AS employee_count,
          SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_employee_count
        FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id
        WHERE d.name LIKE ?
        GROUP BY d.id, d.name
        ORDER BY d.name ASC
        LIMIT ? OFFSET ?
      `;
      queryParams = [`%${search}%`, limit, offset];

      countQuery = `
        SELECT COUNT(*) as total
        FROM departments
        WHERE name LIKE ?
      `;
      countParams = [`%${search}%`];
    } else {
      query = `
        SELECT 
          d.id, 
          d.name,
          COUNT(e.id) AS employee_count,
          SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_employee_count
        FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id
        GROUP BY d.id, d.name
        ORDER BY d.name ASC
        LIMIT ? OFFSET ?
      `;
      queryParams = [limit, offset];

      countQuery = `SELECT COUNT(*) as total FROM departments`;
      countParams = [];
    }

    const departments = await executeQuery({ query, values: queryParams });
    const countResult = await executeQuery({ query: countQuery, values: countParams });
    const total = countResult[0]?.total || 0;

    // Normalize counts to numbers
    const formattedDepartments = departments.map((dept) => ({
      ...dept,
      employee_count: Number(dept.employee_count || 0),
      active_employee_count: Number(dept.active_employee_count || 0),
    }));

    return NextResponse.json({
      departments: formattedDepartments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("Failed to fetch departments:", err);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

// Add a new department
export async function POST(request) {
  const { error } = await requireAdminSession(["admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = departmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid department input" },
        { status: 400 }
      );
    }

    const sanitizedName = parsed.data.name;

    // Check for duplicate
    const checkQuery = `SELECT id FROM departments WHERE name = ?`;
    const existing = await executeQuery({ query: checkQuery, values: [sanitizedName] });

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A department with this name already exists" },
        { status: 409 }
      );
    }

    // Insert new department using native AUTO_INCREMENT
    const insertQuery = `INSERT INTO departments (name) VALUES (?)`;
    const result = await executeQuery({ query: insertQuery, values: [sanitizedName] });

    const department = { id: result.insertId, name: sanitizedName, employee_count: 0, active_employee_count: 0 };

    return NextResponse.json(
      {
        message: "Department created successfully",
        department,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create department:", err);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}