import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

/**
 * GET: Fetch Active Employees for Account Association Combobox
 * Returns active employees with Ashima ID, Name, Department, Position,
 * and a flag indicating whether an admin account is already assigned.
 */
export async function GET(request) {
  const { error } = await requireAdminSession(["admin", "superadmin"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    let whereClause = "WHERE e.status = 'active'";
    const values = [];

    if (search) {
      whereClause += " AND (e.name LIKE ? OR e.ashima_id LIKE ?)";
      values.push(`%${search}%`, `%${search}%`);
    }

    const query = `
      SELECT 
        e.id, 
        e.ashima_id AS ashimaId, 
        e.name, 
        d.name AS department, 
        p.name AS position,
        u.id AS linkedAccountId,
        u.username AS linkedUsername
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN admin_users u ON e.ashima_id = u.employee_id
      ${whereClause}
      ORDER BY e.name ASC
      LIMIT 100
    `;

    const employees = await executeQuery({ query, values });

    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      ashimaId: emp.ashimaId,
      name: emp.name,
      department: emp.department || "Unassigned",
      position: emp.position || "Staff",
      isAssigned: !!emp.linkedAccountId,
      linkedUsername: emp.linkedUsername || null,
    }));

    return NextResponse.json({
      data: formattedEmployees,
    });
  } catch (err) {
    console.error("Error fetching available employees for account linking:", err);
    return NextResponse.json(
      { error: "Failed to fetch employee directory" },
      { status: 500 }
    );
  }
}
