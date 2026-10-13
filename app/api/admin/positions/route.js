import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

// Get all positions with optional pagination and search
export async function GET(request) {
  const { error } = await requireAdminSession(['admin', 'hr']);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const isLeader = searchParams.get('isLeader'); // Add isLeader parameter
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query based on search and isLeader filter
    let query = `SELECT id, name, is_leader FROM positions WHERE 1=1`;
    let queryParams = [];
    
    // Add search condition if provided
    if (search) {
      query += ` AND name LIKE ?`;
      queryParams.push(`%${search}%`);
    }
    
    // Add isLeader condition if provided
    if (isLeader !== null && isLeader !== undefined) {
      query += ` AND is_leader = ?`;
      queryParams.push(isLeader);
    }
    
    // Add order, limit and offset
    query += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    // Count query with the same conditions (except limit/offset)
    let countQuery = `SELECT COUNT(*) as total FROM positions WHERE 1=1`;
    let countParams = [];
    
    if (search) {
      countQuery += ` AND name LIKE ?`;
      countParams.push(`%${search}%`);
    }
    
    if (isLeader !== null && isLeader !== undefined) {
      countQuery += ` AND is_leader = ?`;
      countParams.push(isLeader);
    }
    
    // Execute queries
    const positions = await executeQuery({ query, values: queryParams });
    const countResult = await executeQuery({ query: countQuery, values: countParams });
    const total = countResult[0].total;
    
    return NextResponse.json({
      positions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" }, 
      { status: 500 }
    );
  }
}

// Add a new position with manual ID generation
export async function POST(request) {
  const { error } = await requireAdminSession(['admin']);
  if (error) return error;

  try {
    const { name, is_leader } = await request.json();
    
    // Validate input
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Position name is required and cannot be empty" },
        { status: 400 }
      );
    }
    
    // Sanitize name - trim whitespace
    const sanitizedName = name.trim();
    
    // Check for duplicate
    const checkQuery = `SELECT id FROM positions WHERE name = ?`;
    const existing = await executeQuery({ query: checkQuery, values: [sanitizedName] });
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A position with this name already exists" },
        { status: 409 }
      );
    }
    
    // Insert new position using native AUTO_INCREMENT
    const insertQuery = `INSERT INTO positions (name, is_leader) VALUES (?, ?)`;
    const result = await executeQuery({ query: insertQuery, values: [sanitizedName, is_leader ? 1 : 0] });
    
    // Return the created position with its generated ID
    const position = { id: result.insertId, name: sanitizedName, is_leader: is_leader ? 1 : 0 };
    
    return NextResponse.json({ 
      message: "Position created successfully",
      position 
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to create position:", error);
    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 500 }
    );
  }
}