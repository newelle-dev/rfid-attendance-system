import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { profileSchema } from "@/lib/validations/auth";

export async function PUT(request) {
  const { error, user } = await requireAdminSession();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { error: firstError, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, username, employeeId } = parsed.data;

    // Check if username is already taken by another user
    const checkUsernameQuery = `
      SELECT id FROM admin_users 
      WHERE username = ? AND id != ?
      LIMIT 1
    `;
    
    const usernameExists = await executeQuery({
      query: checkUsernameQuery,
      values: [username, user.id],
    });

    if (usernameExists.length > 0) {
      return NextResponse.json(
        { error: `The username '${username}' is already taken.` },
        { status: 409 }
      );
    }

    // Check if employee ID is already taken by another user
    const checkEmployeeIdQuery = `
      SELECT id FROM admin_users 
      WHERE employee_id = ? AND id != ?
      LIMIT 1
    `;
    
    const employeeIdExists = await executeQuery({
      query: checkEmployeeIdQuery,
      values: [employeeId, user.id],
    });

    if (employeeIdExists.length > 0) {
      return NextResponse.json(
        { error: `The Employee ID '${employeeId}' is already assigned to another account.` },
        { status: 409 }
      );
    }

    // Update user profile
    const updateQuery = `
      UPDATE admin_users 
      SET name = ?, username = ?, employee_id = ?
      WHERE id = ?
    `;

    await executeQuery({
      query: updateQuery,
      values: [name, username, employeeId, user.id],
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}