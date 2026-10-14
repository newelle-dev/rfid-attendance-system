import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getEmployeeStats } from "@/lib/server/employees";

export async function GET() {
  const { error } = await requireAdminSession(['admin', 'hr']);
  if (error) return error;

  try {
    const stats = await getEmployeeStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch employee stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee stats" },
      { status: 500 }
    );
  }
}