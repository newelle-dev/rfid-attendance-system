import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/**
 * Validates whether the incoming request has a valid admin session
 * and optionally checks if the user possesses one of the allowed roles.
 *
 * @param {string[]} [allowedRoles=[]] - Permitted roles (e.g. ['admin', 'hr']).
 *                                        If empty, any authenticated user is allowed.
 *                                        'superadmin' always bypasses specific role restrictions.
 * @returns {Promise<{ error: NextResponse | null, session: any | null, user: any | null }>}
 */
export async function requireAdminSession(allowedRoles = []) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        error: NextResponse.json(
          { error: "Unauthorized: Authentication required" },
          { status: 401 }
        ),
        session: null,
        user: null,
      };
    }

    const userRole = session.user.role;

    if (
      allowedRoles.length > 0 &&
      userRole !== "superadmin" &&
      !allowedRoles.includes(userRole)
    ) {
      return {
        error: NextResponse.json(
          { error: "Forbidden: Insufficient permissions" },
          { status: 403 }
        ),
        session: null,
        user: null,
      };
    }

    return {
      error: null,
      session,
      user: session.user,
    };
  } catch (err) {
    console.error("Session verification error:", err);
    return {
      error: NextResponse.json(
        { error: "Internal authentication error" },
        { status: 500 }
      ),
      session: null,
      user: null,
    };
  }
}
