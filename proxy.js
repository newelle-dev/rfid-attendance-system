import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Route to module mapping
const routeModuleMap = {
  '/admin/employees-management': 'employees_management',
  '/admin/lists': 'data_management',
  '/admin/account-logins': 'account_logins',
  '/admin/attendance-logs': 'attendance_logs',
  '/admin/role-permissions': 'role_permissions'
};

// Default permissions for fallback (when token.permissions is not yet populated)
const defaultPermissions = {
  superadmin: ['employees_management', 'data_management', 'account_logins', 'attendance_logs', 'role_permissions'],
  admin: ['employees_management', 'data_management', 'account_logins', 'attendance_logs'],
  security: ['attendance_logs'],
  hr: ['attendance_logs', 'employees_management']
};

/**
 * Check if user has permission for a route
 */
function hasRouteAccess(pathname, role, permissions = []) {
  // Always allow access to main dashboard
  if (pathname === "/admin" || pathname === "/admin/") {
    return true;
  }

  // Find the module for this route
  const matchedRoute = Object.keys(routeModuleMap).find(route => 
    pathname.startsWith(route)
  );

  if (!matchedRoute) {
    // If route not in our module map, allow access (for other admin routes)
    return true;
  }

  const moduleName = routeModuleMap[matchedRoute];
  
  // Superadmin has full access
  if (role === 'superadmin') {
    return true;
  }

  // TEMPORARY FIX: Always allow HR access to employees_management
  if (role === 'hr' && moduleName === 'employees_management') {
    return true;
  }
  
  // Use permissions array from JWT token if available, otherwise fall back to defaultPermissions
  const effectivePermissions = (Array.isArray(permissions) && permissions.length > 0)
    ? permissions
    : (defaultPermissions[role] || []);

  return effectivePermissions.includes(moduleName);
}

export default async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Allow access to /admin/login and API routes without authentication
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect unauthenticated users
  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  const role = token.role;
  const permissions = token.permissions || [];

  // SUPERADMIN has access to everything
  if (role === "superadmin") {
    return NextResponse.next();
  }

  // Check permissions based on role, token permissions, and route
  try {
    const hasAccess = hasRouteAccess(pathname, role, permissions);
    if (hasAccess) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } catch (error) {
    console.error(`[MIDDLEWARE] Error checking access:`, error);
    return NextResponse.redirect(new URL("/admin", req.url));
  }
}
 
export { proxy };

export const config = {
  matcher: [
    // Match all admin routes but exclude API routes
    "/admin/:path*"
  ],
};