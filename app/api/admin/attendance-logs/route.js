import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

// Fetch attendance logs with employee details, photo, and position
export async function GET(req) {
  const { error } = await requireAdminSession(["admin", "hr", "superadmin", "security"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "100", 10));
    const offset = (page - 1) * limit;
    const search = searchParams.get("search")?.trim() || "";
    const logType = searchParams.get("log_type")?.toUpperCase() || "ALL";
    const department = searchParams.get("department")?.trim() || "";
    const startDate = searchParams.get("start_date")?.trim() || "";
    const endDate = searchParams.get("end_date")?.trim() || "";

    // Build query conditions
    const conditions = [];
    const values = [];

    // Search by Ashima ID or employee name
    if (search) {
      conditions.push("(l.ashima_id LIKE ? OR e.name LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    // Filter by punch status
    if (logType === "IN") {
      conditions.push("l.out_time IS NULL");
    } else if (logType === "OUT") {
      conditions.push("l.out_time IS NOT NULL");
    }

    // Filter by department
    if (department) {
      conditions.push("e.department_id = ?");
      values.push(department);
    }

    // Filter by date range
    if (startDate) {
      conditions.push("DATE(l.in_time) >= ?");
      values.push(startDate);
    }

    if (endDate) {
      conditions.push("DATE(l.in_time) <= ?");
      values.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total records for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM attendance_logs l
      LEFT JOIN employees e ON e.ashima_id = l.ashima_id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereClause}
    `;

    const countResult = await executeQuery({ query: countQuery, values: [...values] });
    const total = countResult[0]?.total || 0;

    // Fetch paginated logs
    const query = `
      SELECT
        l.id, l.ashima_id, e.name, e.department_id,
        d.name AS department, p.name AS position,
        e.photo, e.rfid_tag,
        l.log_type, l.in_time, l.out_time
      FROM
        attendance_logs l
      LEFT JOIN
        employees e ON e.ashima_id = l.ashima_id
      LEFT JOIN
        departments d ON e.department_id = d.id
      LEFT JOIN
        positions p ON e.position_id = p.id
      ${whereClause}
      ORDER BY l.in_time DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await executeQuery({
      query,
      values: [...values, limit, offset],
    });

    const formattedLogs = logs.map((log) => ({
      ...log,
      photo: log.photo ? `data:image/png;base64,${Buffer.from(log.photo).toString("base64")}` : null,
    }));

    return NextResponse.json({
      data: formattedLogs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Failed to fetch attendance logs:", err);
    return NextResponse.json(
      { message: `Failed to fetch attendance logs: ${err.message}` },
      { status: 500 }
    );
  }
}