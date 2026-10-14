import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  const { error } = await requireAdminSession(['admin', 'hr']);
  if (error) return error;

  try {
    const totalQuery = `SELECT COUNT(*) AS total FROM employees`;
    const activeQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'active'`;
    const inactiveQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'inactive'`;
    const resignedQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'resigned'`;

    const [totalResult] = await executeQuery({ query: totalQuery });
    const [activeResult] = await executeQuery({ query: activeQuery });
    const [inactiveResult] = await executeQuery({ query: inactiveQuery });
    const [resignedResult] = await executeQuery({ query: resignedQuery });

    return NextResponse.json({
      total: totalResult?.total || 0,
      active: activeResult?.total || 0,
      inactive: inactiveResult?.total || 0,
      resigned: resignedResult?.total || 0,
    });
  } catch (error) {
    console.error("Failed to fetch employee stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee stats" },
      { status: 500 }
    );
  }
}