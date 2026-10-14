import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

export async function GET(request) {
  const { error } = await requireAdminSession(["admin", "hr"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    // Fetch active employees whose position is designated as a leadership role
    let query = `
      SELECT 
        e.id, 
        e.name, 
        e.ashima_id,
        p.name AS position_name,
        d.name AS department_name,
        (
          SELECT COUNT(*) 
          FROM employees sub 
          WHERE sub.leader = e.id AND sub.status = 'active'
        ) AS team_count
      FROM employees e
      JOIN positions p ON e.position_id = p.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE p.is_leader = 1 AND e.status = 'active'
    `;
    const queryParams = [];

    if (search) {
      query += " AND (e.name LIKE ? OR e.ashima_id LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY e.name ASC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const leaders = await executeQuery({ query, values: queryParams });

    // Total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM employees e
      JOIN positions p ON e.position_id = p.id
      WHERE p.is_leader = 1 AND e.status = 'active'
    `;
    const countParams = [];

    if (search) {
      countQuery += " AND (e.name LIKE ? OR e.ashima_id LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await executeQuery({ query: countQuery, values: countParams });
    const total = countResult[0]?.total || 0;

    const formattedLeaders = leaders.map((leader) => ({
      ...leader,
      team_count: Number(leader.team_count || 0),
    }));

    return NextResponse.json({
      leaders: formattedLeaders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("Failed to fetch leaders:", err);
    return NextResponse.json(
      { error: "Failed to fetch leaders" },
      { status: 500 }
    );
  }
}