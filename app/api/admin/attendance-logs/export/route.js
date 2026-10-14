import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import dayjs from "dayjs";

export async function GET(req) {
  const { error } = await requireAdminSession(["admin", "hr", "superadmin", "security"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const search = searchParams.get("search")?.trim() || "";
    const logType = searchParams.get("log_type")?.toUpperCase() || "";
    const department = searchParams.get("department")?.trim() || "";
    const startDate = searchParams.get("start_date")?.trim() || "";
    const endDate = searchParams.get("end_date")?.trim() || "";

    // Build the search condition
    const conditions = [];
    const values = [];

    // Search condition
    if (search) {
      conditions.push("(l.ashima_id LIKE ? OR e.name LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }

    // Punch status filter
    if (logType === "IN") {
      conditions.push("l.out_time IS NULL");
    } else if (logType === "OUT") {
      conditions.push("l.out_time IS NOT NULL");
    }

    // Department filter
    if (department) {
      conditions.push("e.department_id = ?");
      values.push(department);
    }

    // Date range filters
    if (startDate) {
      conditions.push("DATE(l.in_time) >= ?");
      values.push(startDate);
    }

    if (endDate) {
      conditions.push("DATE(l.in_time) <= ?");
      values.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Query to fetch logs for export
    const query = `
      SELECT
        l.ashima_id, e.name, d.name AS department, p.name AS position,
        l.in_time, l.out_time
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
    `;

    const logs = await executeQuery({ query, values });

    // Generate CSV content
    const headers = [
      "Ashima ID",
      "Employee Name",
      "Department",
      "Position",
      "Date",
      "Time In",
      "Time Out",
      "Shift Duration",
      "Status",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let csvContent = headers.join(",") + "\n";

    logs.forEach((log) => {
      const inDay = log.in_time ? dayjs(log.in_time) : null;
      const outDay = log.out_time ? dayjs(log.out_time) : null;

      const dateStr = inDay ? inDay.format("YYYY-MM-DD") : "N/A";
      const timeInStr = inDay ? inDay.format("hh:mm:ss A") : "N/A";
      const timeOutStr = outDay ? outDay.format("hh:mm:ss A") : "—";

      let durationStr = "Active / In Progress";
      let statusStr = "On-Premise";

      if (inDay && outDay) {
        statusStr = "Completed";
        const diffMins = outDay.diff(inDay, "minute");
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        durationStr = `${hours}h ${mins}m`;
      }

      const row = [
        escapeCsv(log.ashima_id),
        escapeCsv(log.name || "N/A"),
        escapeCsv(log.department || "Unassigned"),
        escapeCsv(log.position || "N/A"),
        escapeCsv(dateStr),
        escapeCsv(timeInStr),
        escapeCsv(timeOutStr),
        escapeCsv(durationStr),
        escapeCsv(statusStr),
      ];

      csvContent += row.join(",") + "\n";
    });

    const exportDate = dayjs().format("YYYY-MM-DD");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="attendance_logs_${exportDate}.csv"`,
      },
    });
  } catch (error) {
    console.error("Failed to export attendance logs:", error);
    return NextResponse.json(
      { message: "Failed to export attendance logs" },
      { status: 500 }
    );
  }
}