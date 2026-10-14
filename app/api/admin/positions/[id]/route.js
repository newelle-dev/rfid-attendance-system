import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { positionSchema } from "@/lib/validations/lists";

// Get a specific position
export async function GET(request, context) {
  const { error } = await requireAdminSession(["admin", "hr"]);
  if (error) return error;

  try {
    const { id } = await context.params;

    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.is_leader,
        COUNT(e.id) AS employee_count,
        SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_employee_count
      FROM positions p
      LEFT JOIN employees e ON e.position_id = p.id
      WHERE p.id = ?
      GROUP BY p.id, p.name, p.is_leader
    `;
    const positions = await executeQuery({ query, values: [id] });

    if (positions.length === 0) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 }
      );
    }

    const pos = positions[0];
    return NextResponse.json({
      position: {
        ...pos,
        is_leader: Boolean(pos.is_leader),
        employee_count: Number(pos.employee_count || 0),
        active_employee_count: Number(pos.active_employee_count || 0),
      },
    });
  } catch (err) {
    console.error("Failed to fetch position:", err);
    return NextResponse.json(
      { error: "Failed to fetch position" },
      { status: 500 }
    );
  }
}

// Update a position
export async function PUT(request, context) {
  const { error } = await requireAdminSession(["admin"]);
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = positionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid position input" },
        { status: 400 }
      );
    }

    const sanitizedName = parsed.data.name;
    const isLeaderVal = parsed.data.is_leader ? 1 : 0;

    // Check for duplicate (excluding current position)
    const checkQuery = `SELECT id FROM positions WHERE name = ? AND id != ?`;
    const existing = await executeQuery({
      query: checkQuery,
      values: [sanitizedName, id],
    });

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A position with this name already exists" },
        { status: 409 }
      );
    }

    // Update position
    const updateQuery = `UPDATE positions SET name = ?, is_leader = ? WHERE id = ?`;
    await executeQuery({
      query: updateQuery,
      values: [sanitizedName, isLeaderVal, id],
    });

    return NextResponse.json({
      message: "Position updated successfully",
      position: {
        id: Number(id),
        name: sanitizedName,
        is_leader: Boolean(isLeaderVal),
      },
    });
  } catch (err) {
    console.error("Failed to update position:", err);
    return NextResponse.json(
      { error: "Failed to update position" },
      { status: 500 }
    );
  }
}

// Delete a position
export async function DELETE(request, context) {
  const { error } = await requireAdminSession(["admin"]);
  if (error) return error;

  try {
    const { id } = await context.params;

    // Check if position is in use by any employee
    const checkQuery = `SELECT COUNT(*) as count FROM employees WHERE position_id = ?`;
    const result = await executeQuery({ query: checkQuery, values: [id] });

    if (result[0]?.count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete position: ${result[0].count} employee(s) are currently assigned to it. Please reassign them first.`,
        },
        { status: 400 }
      );
    }

    // Delete position
    const deleteQuery = `DELETE FROM positions WHERE id = ?`;
    await executeQuery({ query: deleteQuery, values: [id] });

    return NextResponse.json({
      message: "Position deleted successfully",
      success: true,
    });
  } catch (err) {
    console.error("Failed to delete position:", err);
    return NextResponse.json(
      { error: "Failed to delete position" },
      { status: 500 }
    );
  }
}