import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  role: z.enum(["superadmin", "admin", "security", "hr"]),
});

function safeParsePermission(permission) {
  if (typeof permission === "object" && permission !== null) {
    return permission;
  }
  if (typeof permission === "string") {
    try {
      return JSON.parse(permission);
    } catch {
      return { access: false };
    }
  }
  return { access: false };
}

export async function GET(request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      role: searchParams.get("role"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Role parameter is required" }, { status: 400 });
    }

    // Get permissions for the specific role
    const permissions = await executeQuery({
      query: `
        SELECT 
          module,
          permission
        FROM role_permissions 
        WHERE role = ?
      `,
      values: [parsed.data.role],
    });

    // Parse JSON permissions safely (mysql2 may already return JSON columns as parsed objects)
    const formattedPermissions = (Array.isArray(permissions) ? permissions : []).map((perm) => ({
      ...perm,
      permission: safeParsePermission(perm.permission),
    }));

    return NextResponse.json({ permissions: formattedPermissions });
  } catch (err) {
    console.error("Error fetching role permissions by role:", err);
    return NextResponse.json({ error: "Failed to fetch role permissions" }, { status: 500 });
  }
}
