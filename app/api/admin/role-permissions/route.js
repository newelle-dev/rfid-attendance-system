import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { z } from "zod";

const roleEnum = z.enum(["superadmin", "admin", "security", "hr"]);

const permissionObjectSchema = z.record(z.any());

const postSchema = z.object({
  role: roleEnum,
  module: z.string().min(1, "Role and module are required"),
  permission: permissionObjectSchema,
});

const putSchema = z.object({
  permissions: z.array(
    z.object({
      role: roleEnum,
      module: z.string().min(1),
      permission: permissionObjectSchema,
    })
  ).min(1, "Permissions array is required"),
});

const deleteQuerySchema = z.object({
  role: roleEnum,
  module: z.string().min(1, "Role and module are required"),
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

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const permissions = await executeQuery({
      query: `
        SELECT 
          id,
          role,
          module,
          permission,
          created_at,
          updated_at
        FROM role_permissions 
        ORDER BY 
          FIELD(role, 'superadmin', 'admin', 'security', 'hr'),
          module
      `,
    });

    const formattedPermissions = (Array.isArray(permissions) ? permissions : []).map((perm) => ({
      ...perm,
      permission: safeParsePermission(perm.permission),
    }));

    return NextResponse.json({ permissions: formattedPermissions });
  } catch (err) {
    console.error("Error fetching role permissions:", err);
    return NextResponse.json({ error: "Failed to fetch role permissions" }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = await requireAdminSession(["superadmin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Role, module, and permission are required" }, { status: 400 });
    }

    const { role, module, permission } = parsed.data;

    await executeQuery({
      query: `
        INSERT INTO role_permissions (role, module, permission) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        permission = VALUES(permission),
        updated_at = CURRENT_TIMESTAMP
      `,
      values: [role, module, JSON.stringify(permission)],
    });

    return NextResponse.json({ message: "Role permission updated successfully" });
  } catch (err) {
    console.error("Error updating role permission:", err);
    return NextResponse.json({ error: "Failed to update role permission" }, { status: 500 });
  }
}

export async function PUT(request) {
  const { error } = await requireAdminSession(["superadmin"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Permissions array is required" }, { status: 400 });
    }

    const { permissions } = parsed.data;

    for (const perm of permissions) {
      await executeQuery({
        query: `
          INSERT INTO role_permissions (role, module, permission) 
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          permission = VALUES(permission),
          updated_at = CURRENT_TIMESTAMP
        `,
        values: [perm.role, perm.module, JSON.stringify(perm.permission)],
      });
    }

    return NextResponse.json({ message: "Bulk permissions updated successfully" });
  } catch (err) {
    console.error("Error bulk updating permissions:", err);
    return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { error } = await requireAdminSession(["superadmin"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = deleteQuerySchema.safeParse({
      role: searchParams.get("role"),
      module: searchParams.get("module"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Role and module are required" }, { status: 400 });
    }

    const { role, module } = parsed.data;

    await executeQuery({
      query: `DELETE FROM role_permissions WHERE role = ? AND module = ?`,
      values: [role, module],
    });

    return NextResponse.json({ message: "Role permission deleted successfully" });
  } catch (err) {
    console.error("Error deleting role permission:", err);
    return NextResponse.json({ error: "Failed to delete role permission" }, { status: 500 });
  }
}
