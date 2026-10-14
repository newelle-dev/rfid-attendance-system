import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import { passwordChangeApiSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

export async function PUT(request) {
  const { error, user } = await requireAdminSession();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = passwordChangeApiSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Validation failed";
      return NextResponse.json(
        { error: firstError, details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Get current user data
    const getUserQuery = `
      SELECT password FROM admin_users WHERE id = ? LIMIT 1
    `;
    
    const dbUsers = await executeQuery({
      query: getUserQuery,
      values: [user.id],
    });

    if (dbUsers.length === 0) {
      return NextResponse.json(
        { error: "User account not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      dbUsers[0].password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const updateQuery = `
      UPDATE admin_users 
      SET password = ?
      WHERE id = ?
    `;

    await executeQuery({
      query: updateQuery,
      values: [hashedPassword, user.id],
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}