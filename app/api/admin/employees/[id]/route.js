import { executeQuery } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { employeeSchema } from "@/lib/validations/employees";
import { z } from "zod";

// Helper function to decode Base64 to binary with better error handling
function decodeBase64ToBinary(base64String) {
  if (!base64String || typeof base64String !== "string") {
    return null;
  }
  try {
    const base64Data = base64String.includes("data:image")
      ? base64String.replace(/^data:image\/\w+;base64,/, "")
      : base64String;
    return Buffer.from(base64Data, "base64");
  } catch (error) {
    console.error("Error decoding base64 string:", error);
    return null;
  }
}

// PUT: Update an Existing Employee
export async function PUT(req, context) {
  const { error } = await requireAdminSession(['admin', 'hr']);
  if (error) return error;

  try {
    const { id: rawId } = await context.params;
    const idParsed = z.coerce.number().int().positive().safeParse(rawId);
    if (!idParsed.success) {
      return NextResponse.json(
        { message: "A valid numeric Employee ID is required" },
        { status: 400 }
      );
    }
    const id = idParsed.data;

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
      status,
      removePhoto,
    } = parsed.data;

    // Check for duplicate ashima_id or rfid_tag assigned to another employee
    const duplicate = await executeQuery({
      query: `SELECT id, ashima_id, rfid_tag FROM employees WHERE (ashima_id = ? OR (? IS NOT NULL AND rfid_tag = ?)) AND id != ? LIMIT 1`,
      values: [ashima_id, rfid_tag, rfid_tag, id],
    });

    if (duplicate.length > 0) {
      if (duplicate[0].ashima_id === ashima_id) {
        return NextResponse.json(
          { message: `Employee ID '${ashima_id}' is already registered to another employee.` },
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

    let binaryPhoto = null;
    if (status === "resigned" || removePhoto) {
      binaryPhoto = null;
    } else if (photo) {
      binaryPhoto = decodeBase64ToBinary(photo);
    }

    const updateFields = [];
    const values = [];

    updateFields.push("ashima_id = ?");
    values.push(ashima_id);

    updateFields.push("name = ?");
    values.push(name);

    updateFields.push("department_id = ?");
    values.push(department_id || null);

    updateFields.push("position_id = ?");
    values.push(position_id || null);

    updateFields.push("leader = ?");
    values.push(leader || null);

    updateFields.push("rfid_tag = ?");
    values.push(status === "resigned" || !rfid_tag ? null : rfid_tag);

    if (status === "resigned" || removePhoto || photo) {
      updateFields.push("photo = ?");
      values.push(binaryPhoto);
    }

    updateFields.push("emp_stat = ?");
    values.push(emp_stat);

    updateFields.push("status = ?");
    values.push(status);

    values.push(id);

    const updateQuery = `
      UPDATE employees 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    const result = await executeQuery({ query: updateQuery, values });

    if (!result || result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No employee was updated. The employee may not exist." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Employee updated successfully",
      employeeId: id,
      status: status,
      photoRemoved: status === "resigned" || removePhoto,
    });
  } catch (err) {
    console.error("Failed to update employee:", err);
    return NextResponse.json(
      { message: `Failed to update employee: ${err.message}` },
      { status: 500 }
    );
  }
}

// DELETE: Delete an Employee by ID
export async function DELETE(req, context) {
  const { error } = await requireAdminSession(['admin', 'hr']);
  if (error) return error;

  try {
    const { id: rawId } = await context.params;
    const idParsed = z.coerce.number().int().positive().safeParse(rawId);
    if (!idParsed.success) {
      return NextResponse.json(
        { message: "A valid numeric Employee ID is required" },
        { status: 400 }
      );
    }

    const id = idParsed.data;

    const query = `DELETE FROM employees WHERE id = ?`;
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