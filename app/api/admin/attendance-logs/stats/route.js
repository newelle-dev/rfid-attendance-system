import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  const { error } = await requireAdminSession(["admin", "hr", "superadmin", "security"]);
  if (error) return error;

  try {
    // Get today's local date YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // Count unique employees who logged today
    const todayQuery = `
      SELECT COUNT(DISTINCT ashima_id) as count
      FROM attendance_logs
      WHERE DATE(in_time) = ?
    `;
    const todayResult = await executeQuery({
      query: todayQuery,
      values: [today],
    });

    // Count total logs
    const totalLogsQuery = `
      SELECT COUNT(*) as count
      FROM attendance_logs
    `;
    const totalLogsResult = await executeQuery({ query: totalLogsQuery });

    // Count active shifts (time in only / out_time IS NULL)
    const timeInOnlyQuery = `
      SELECT COUNT(*) as count
      FROM attendance_logs
      WHERE out_time IS NULL
    `;
    const timeInOnlyResult = await executeQuery({ query: timeInOnlyQuery });

    // Count completed shifts (both time in and time out)
    const completeLogsQuery = `
      SELECT COUNT(*) as count
      FROM attendance_logs
      WHERE out_time IS NOT NULL
    `;
    const completeLogsResult = await executeQuery({ query: completeLogsQuery });

    return NextResponse.json({
      todayCount: todayResult[0]?.count || 0,
      total_logs: totalLogsResult[0]?.count || 0,
      in_only: timeInOnlyResult[0]?.count || 0,
      complete_logs: completeLogsResult[0]?.count || 0,
    });
  } catch (error) {
    console.error("Failed to fetch attendance stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch attendance stats" },
      { status: 500 }
    );
  }
}