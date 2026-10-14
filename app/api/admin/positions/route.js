import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { z } from "zod";

const createPositionSchema = z.object({
  name: z
    .string({ required_error: "Position name is required" })
    .trim()
    .min(1, "Position name is required and cannot be empty")
    .max(255, "Position name cannot exceed 255 characters"),
  is_leader: z.union([z.boolean(), z.number()]).optional().default(false),
});

// Get all positions with optional pagination, search, leader filter, and employee headcounts
export async function GET(request) {
  const { error } = await requireAdminSession(["admin", "hr"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const search = searchParams.get("search") || "";
    const isLeader = searchParams.get("isLeader");

    // Calculate offset
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const whereParams = [];

    if (search) {
      whereClause += " AND p.name LIKE ?";
      whereParams.push(`%${search}%`);
    }

    if (isLeader !== null && isLeader !== undefined && isLeader !== "" && isLeader !== "all") {
      whereClause += " AND p.is_leader = ?";
      whereParams.push(isLeader === "1" || isLeader === 1 || isLeader === "true" ? 1 : 0);
    }

    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.is_leader,
        COUNT(e.id) AS employee_count,
        SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS active_employee_count
      FROM positions p
      LEFT JOIN employees e ON e.position_id = p.id
      ${whereClause}
      GROUP BY p.id, p.name, p.is_leader
      ORDER BY p.name ASC
      LIMIT ? OFFSET ?
    `;
    const queryParams = [...whereParams, limit, offset];

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM positions p 
      ${whereClause}
    `;
    const countParams = [...whereParams];

    const positions = await executeQuery({ query, values: queryParams });
    const countResult = await executeQuery({ query: countQuery, values: countParams });
    const total = countResult[0]?.total || 0;

    const formattedPositions = positions.map((pos) => ({
      ...pos,
      is_leader: Boolean(pos.is_leader),
      employee_count: Number(pos.employee_count || 0),
      active_employee_count: Number(pos.active_employee_count || 0),
    }));

    return NextResponse.json({
      positions: formattedPositions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("Failed to fetch positions:", err);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    );
  }
}

// Add a new position
export async function POST(request) {
  const { error } = await requireAdminSession(["admin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = createPositionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid position input" },
        { status: 400 }
      );
    }

    const sanitizedName = parsed.data.name;
    const isLeaderVal = parsed.data.is_leader ? 1 : 0;

    // Check for duplicate
    const checkQuery = `SELECT id FROM positions WHERE name = ?`;
    const existing = await executeQuery({ query: checkQuery, values: [sanitizedName] });

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A position with this name already exists" },
        { status: 409 }
      );
    }

    // Insert new position
    const insertQuery = `INSERT INTO positions (name, is_leader) VALUES (?, ?)`;
    const result = await executeQuery({
      query: insertQuery,
      values: [sanitizedName, isLeaderVal],
    });

    const position = {
      id: result.insertId,
      name: sanitizedName,
      is_leader: Boolean(isLeaderVal),
      employee_count: 0,
      active_employee_count: 0,
    };

    return NextResponse.json(
      {
        message: "Position created successfully",
        position,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create position:", err);
    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 500 }
    );
  }
}