import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { employeeSchema } from "@/lib/validations/employees";
import { getEmployeesData } from "@/lib/server/employees";
import { z } from "zod";

// Helper function to decode Base64 to binary
function decodeBase64ToBinary(base64String) {
  return Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ""), "base64");
}

// GET: Fetch Employees with Search, Filters, and Pagination
export async function GET(req) {
  const { error } = await requireAdminSession(['admin', 'hr']);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const position = searchParams.get("position") || "";
    const leader = searchParams.get("leader") || "";
    const status = searchParams.get("status") || "";

    const result = await getEmployeesData({
      page,
      limit,
      search,
      department,
      position,
      leader,
      status,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to fetch employees:", err);
    return NextResponse.json(
      { message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST: Add a New Employee
export async function POST(req) {
  const { error } = await requireAdminSession(['admin', 'hr']);
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = employeeSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { message: firstError, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      ashima_id,
      name,
      department_id,
      position_id,
      leader,
      rfid_tag,
      photo,
      emp_stat,
    } = parsed.data;

    // Check for duplicate ashima_id or rfid_tag
    const duplicate = await executeQuery({
      query: `SELECT ashima_id, rfid_tag FROM employees WHERE ashima_id = ? OR (? IS NOT NULL AND rfid_tag = ?) LIMIT 1`,
      values: [ashima_id, rfid_tag, rfid_tag],
    });

    if (duplicate.length > 0) {
      if (duplicate[0].ashima_id === ashima_id) {
        return NextResponse.json(
          { message: `Employee ID '${ashima_id}' is already registered.` },
          { status: 409 }
        );
      }
      if (rfid_tag && duplicate[0].rfid_tag === rfid_tag) {
        return NextResponse.json(
          { message: `RFID tag '${rfid_tag}' is already assigned to another employee.` },
          { status: 409 }
        );
      }
    }

    // Decode Base64 photo to binary
    const binaryPhoto = photo ? decodeBase64ToBinary(photo) : null;

    const insertQuery = `
      INSERT INTO employees (ashima_id, name, department_id, position_id, leader, rfid_tag, photo, emp_stat, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery({
      query: insertQuery,
      values: [
        ashima_id,
        name,
        department_id || null,
        position_id || null,
        leader || null,
        rfid_tag || null,
        binaryPhoto,
        emp_stat || "regular",
        "active",
      ],
    });

    // Get the newly inserted ID
    const insertedId = result.insertId;

    // Fetch the complete employee record with the new ID
    const newEmployee = await executeQuery({
      query: "SELECT * FROM employees WHERE id = ?",
      values: [insertedId],
    });

    return NextResponse.json(
      {
        message: "Employee added successfully",
        employee: newEmployee[0],
        id: insertedId,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to add employee:", err);
    return NextResponse.json(
      { message: `Failed to add employee: ${err.message}` },
      { status: 500 }
    );
  }
}

// DELETE: Delete an Employee
export async function DELETE(req) {
  const { error } = await requireAdminSession(['admin', 'hr']);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get("id");

    const idParsed = z.coerce.number().int().positive().safeParse(rawId);
    if (!idParsed.success) {
      return NextResponse.json(
        { message: "A valid numeric Employee ID is required" },
        { status: 400 }
      );
    }

    const id = idParsed.data;

    const query = `
      DELETE FROM employees 
      WHERE id = ?
    `;

    await executeQuery({ query, values: [id] });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Failed to delete employee:", err);
    return NextResponse.json(
      { message: "Failed to delete employee" },
      { status: 500 }
    );
  }
}