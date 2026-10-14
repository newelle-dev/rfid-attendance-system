import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

/**
 * GET: Aggregated Account Statistics for KPI Metric Strip
 * Requires admin or superadmin session.
 */
export async function GET() {
  const { error } = await requireAdminSession(["admin", "superadmin"]);
  if (error) return error;

  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'superadmin' THEN 1 ELSE 0 END) as superadmin,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin,
        SUM(CASE WHEN role = 'security' THEN 1 ELSE 0 END) as security,
        SUM(CASE WHEN role = 'hr' THEN 1 ELSE 0 END) as hr,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as recentAccounts
      FROM admin_users
    `;

    const result = await executeQuery({ query: statsQuery });
    const row = result[0] || {};

    return NextResponse.json({
      total: Number(row.total || 0),
      superadmin: Number(row.superadmin || 0),
      admin: Number(row.admin || 0),
      security: Number(row.security || 0),
      hr: Number(row.hr || 0),
      recentAccounts: Number(row.recentAccounts || 0),
    });
  } catch (error) {
    console.error("Error fetching account statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch account statistics" },
      { status: 500 }
    );
  }
}