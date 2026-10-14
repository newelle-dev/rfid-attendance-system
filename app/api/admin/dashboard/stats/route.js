import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

let cachedColumns = null;

async function getAttendanceColumns() {
  if (cachedColumns) return cachedColumns;
  try {
    const cols = await executeQuery({ query: "SHOW COLUMNS FROM attendance_logs" });
    const colNames = new Set(cols.map((c) => c.Field.toLowerCase()));
    cachedColumns = {
      hasTimestamp: colNames.has("timestamp"),
      hasInTime: colNames.has("in_time"),
      hasOutTime: colNames.has("out_time"),
      hasDeviceId: colNames.has("device_id"),
      hasEmployeeId: colNames.has("employee_id"),
      hasRfidTag: colNames.has("rfid_tag"),
    };
    return cachedColumns;
  } catch (err) {
    console.warn("Could not inspect columns, falling back to schema defaults:", err.message);
    return {
      hasTimestamp: false,
      hasInTime: true,
      hasOutTime: true,
      hasDeviceId: false,
      hasEmployeeId: false,
      hasRfidTag: false,
    };
  }
}

export async function GET() {
  const { error } = await requireAdminSession(["superadmin", "admin", "security", "hr"]);
  if (error) return error;

  try {
    const cols = await getAttendanceColumns();

    // 1. Total active employees
    const empQuery = `
      SELECT e.id, e.ashima_id, e.name, e.department_id, d.name AS department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
    `;
    const activeEmployees = await executeQuery({ query: empQuery });
    const totalActiveEmployees = activeEmployees.length;

    // 2. Fetch today's logs to compute live headcount
    // We determine the timestamp expression and date condition based on schema
    let timeExpr = "al.in_time";
    let todayCond = "DATE(al.in_time) = CURDATE()";
    if (cols.hasTimestamp) {
      timeExpr = "COALESCE(al.timestamp, al.in_time, al.created_at)";
      todayCond = `(DATE(${timeExpr}) = CURDATE() ${cols.hasOutTime ? "OR DATE(al.out_time) = CURDATE()" : ""})`;
    } else if (cols.hasOutTime) {
      todayCond = "(DATE(al.in_time) = CURDATE() OR DATE(al.out_time) = CURDATE())";
    }

    const todayLogsQuery = `
      SELECT 
        al.id,
        al.ashima_id,
        al.log_type,
        ${cols.hasInTime ? "al.in_time" : "NULL as in_time"},
        ${cols.hasOutTime ? "al.out_time" : "NULL as out_time"},
        ${timeExpr} AS punch_time,
        ${cols.hasDeviceId ? "al.device_id" : "'KIOSK-MAIN-01' as device_id"}
      FROM attendance_logs al
      WHERE ${todayCond}
      ORDER BY ${timeExpr} DESC
    `;
    const todayLogs = await executeQuery({ query: todayLogsQuery });

    // Map each employee's status today
    // Group logs by ashima_id and find current state
    const employeeLatestState = new Map();
    let totalScansToday = 0;

    for (const log of todayLogs) {
      totalScansToday += 1;
      const ashimaId = log.ashima_id;
      if (!employeeLatestState.has(ashimaId)) {
        // First log encountered is the latest one due to ORDER BY punch_time DESC
        let state = "present";
        const rawType = (log.log_type || "").toUpperCase();

        if (cols.hasOutTime && log.out_time && (!log.in_time || new Date(log.out_time) >= new Date(log.in_time))) {
          state = "timed_out";
        } else if (rawType === "OUT" || rawType === "TIME_OUT") {
          state = "timed_out";
        } else if (rawType === "BREAK_IN") {
          state = "on_break";
        } else if (rawType === "IN" || rawType === "TIME_IN" || rawType === "BREAK_OUT") {
          state = "present";
        }

        employeeLatestState.set(ashimaId, state);
      }
    }

    let currentlyPresent = 0;
    let onBreak = 0;
    let timedOut = 0;
    let notYetIn = 0;

    // Track present counts per department
    const deptStats = new Map();

    for (const emp of activeEmployees) {
      const state = employeeLatestState.get(emp.ashima_id);
      if (state === "present") {
        currentlyPresent++;
      } else if (state === "on_break") {
        onBreak++;
      } else if (state === "timed_out") {
        timedOut++;
      } else {
        notYetIn++;
      }

      const deptId = emp.department_id || 0;
      const deptName = emp.department_name || "Unassigned";
      if (!deptStats.has(deptId)) {
        deptStats.set(deptId, {
          id: deptId,
          name: deptName,
          totalEmployees: 0,
          presentCount: 0,
        });
      }
      const d = deptStats.get(deptId);
      d.totalEmployees += 1;
      if (state === "present") {
        d.presentCount += 1;
      }
    }

    const attendanceRate = totalActiveEmployees > 0 
      ? Math.round((currentlyPresent / totalActiveEmployees) * 100) 
      : 0;

    // 3. Departments list formatted with percentage
    const departments = Array.from(deptStats.values())
      .map((d) => ({
        ...d,
        percentage: d.totalEmployees > 0 ? Math.round((d.presentCount / d.totalEmployees) * 100) : 0,
      }))
      .sort((a, b) => b.totalEmployees - a.totalEmployees);

    // 4. Recent logs with employee names and departments (limit 15)
    const recentLogsQuery = `
      SELECT 
        al.id,
        al.ashima_id,
        COALESCE(e.name, 'Unknown Employee') AS name,
        COALESCE(d.name, 'General') AS department,
        al.log_type,
        ${timeExpr} AS timestamp,
        ${cols.hasDeviceId ? "COALESCE(al.device_id, 'KIOSK-MAIN-01')" : "'KIOSK-MAIN-01'"} AS device_id
      FROM attendance_logs al
      LEFT JOIN employees e ON al.ashima_id = e.ashima_id
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY ${timeExpr} DESC
      LIMIT 15
    `;
    const rawRecent = await executeQuery({ query: recentLogsQuery });

    const recentLogs = rawRecent.map((log) => {
      let normType = "time_in";
      const raw = (log.log_type || "").toUpperCase();
      if (raw === "OUT" || raw === "TIME_OUT") normType = "time_out";
      else if (raw === "BREAK_IN") normType = "break_in";
      else if (raw === "BREAK_OUT") normType = "break_out";
      else normType = "time_in";

      return {
        id: log.id,
        ashimaId: log.ashima_id,
        name: log.name,
        department: log.department,
        logType: normType,
        timestamp: log.timestamp,
        deviceId: log.device_id || "KIOSK-MAIN-01",
      };
    });

    // 5. Kiosk status details
    const lastScan = recentLogs.length > 0 ? recentLogs[0] : null;
    let kioskStatus = "idle";
    if (lastScan && lastScan.timestamp) {
      const diffMs = Date.now() - new Date(lastScan.timestamp).getTime();
      // If punch within 30 minutes, mark as online
      if (diffMs >= 0 && diffMs <= 30 * 60 * 1000) {
        kioskStatus = "online";
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary: {
        totalActiveEmployees,
        currentlyPresent,
        onBreak,
        timedOut,
        notYetIn,
        attendanceRate,
        totalScansToday,
      },
      kioskStatus: {
        deviceId: lastScan?.deviceId || "KIOSK-MAIN-01",
        status: kioskStatus,
        lastScanAt: lastScan?.timestamp || null,
        scansToday: totalScansToday,
      },
      recentLogs,
      departments,
    });
  } catch (error) {
    const isConnRefused =
      error?.code === "ECONNREFUSED" ||
      (error?.errors && error.errors.some((e) => e.code === "ECONNREFUSED"));

    if (isConnRefused) {
      console.warn("Database connection refused: MySQL is not running on port 3306.");
      return NextResponse.json(
        {
          error: "Database Connection Offline",
          message: "Unable to connect to MySQL database at localhost:3306. Please start your MySQL service.",
          isDbOffline: true,
        },
        { status: 503 }
      );
    }

    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats", message: error.message },
      { status: 500 }
    );
  }
}