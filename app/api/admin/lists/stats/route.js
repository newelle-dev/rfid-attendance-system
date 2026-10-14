import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

/**
 * GET /api/admin/lists/stats
 * Aggregate metrics for Data Management command hub:
 * - Total Departments
 * - Total Positions
 * - Leadership Positions
 * - Active Leaders
 */
export async function GET() {
  const { error } = await requireAdminSession(["admin", "hr"]);
  if (error) return error;

  try {
    const [deptResult] = await executeQuery({
      query: `SELECT COUNT(*) AS total FROM departments`,
    });

    const [posResult] = await executeQuery({
      query: `SELECT COUNT(*) AS total FROM positions`,
    });

    const [leaderPosResult] = await executeQuery({
      query: `SELECT COUNT(*) AS total FROM positions WHERE is_leader = 1`,
    });

    const [activeLeaderResult] = await executeQuery({
      query: `
        SELECT COUNT(DISTINCT e.id) AS total
        FROM employees e
        JOIN positions p ON e.position_id = p.id
        WHERE p.is_leader = 1 AND e.status = 'active'
      `,
    });

    return NextResponse.json({
      totalDepartments: deptResult?.total || 0,
      totalPositions: posResult?.total || 0,
      leadershipPositions: leaderPosResult?.total || 0,
      activeLeaders: activeLeaderResult?.total || 0,
    });
  } catch (err) {
    console.error("Failed to fetch data management stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch data management statistics" },
      { status: 500 }
    );
  }
}
