import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { z } from "zod";

const updateDepartmentSchema = z.object({
  name: z
    .string({ required_error: "Department name is required" })
    .trim()
    .min(1, "Department name is required and cannot be empty")
    .max(255, "Department name cannot exceed 255 characters"),
});

// Get a specific department
export async function GET(request, context) {
  const { error } = await requireAdminSession(["admin", "hr"]);
  if (error) return error;

  try {
    const { id } = await context.params;

    const query = `
      SELECT 
        d.id, 
        d.name,
        COUNT(e.id) AS employee_count,
        SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_employee_count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id
      WHERE d.id = ?
      GROUP BY d.id, d.name
    `;
    const departments = await executeQuery({ query, values: [id] });

    if (departments.length === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const dept = departments[0];
    return NextResponse.json({
      department: {
        ...dept,
        employee_count: Number(dept.employee_count || 0),
        active_employee_count: Number(dept.active_employee_count || 0),
      },
    });
  } catch (err) {
    console.error("Failed to fetch department:", err);
    return NextResponse.json(
      { error: "Failed to fetch department" },
      { status: 500 }
    );
  }
}

// Update a department
export async function PUT(request, context) {
  const { error } = await requireAdminSession(["admin"]);
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateDepartmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid department name" },
        { status: 400 }
      );
    }

    const sanitizedName = parsed.data.name;

    // Check for duplicate (excluding current department)
    const checkQuery = `SELECT id FROM departments WHERE name = ? AND id != ?`;
    const existing = await executeQuery({
      query: checkQuery,
      values: [sanitizedName, id],
    });

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A department with this name already exists" },
        { status: 409 }
      );
    }

    // Update department
    const updateQuery = `UPDATE departments SET name = ? WHERE id = ?`;
    await executeQuery({ query: updateQuery, values: [sanitizedName, id] });

    return NextResponse.json({ id: Number(id), name: sanitizedName });
  } catch (err) {
    console.error("Failed to update department:", err);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

// Delete a department
export async function DELETE(request, context) {
  const { error } = await requireAdminSession(["admin"]);
  if (error) return error;

  try {
    const { id } = await context.params;

    // Check if department is in use by any employee
    const checkQuery = `SELECT COUNT(*) as count FROM employees WHERE department_id = ?`;
    const result = await executeQuery({ query: checkQuery, values: [id] });

    if (result[0]?.count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete department: ${result[0].count} employee(s) are currently assigned to it. Please reassign them first.`,
        },
        { status: 400 }
      );
    }

    // Delete department
    const deleteQuery = `DELETE FROM departments WHERE id = ?`;
    await executeQuery({ query: deleteQuery, values: [id] });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete department:", err);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}