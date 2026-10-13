import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { executeQuery } from "@/lib/db";

// Helper function to get user by username or employee ID
async function getUserByIdentifier(identifier) {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        username, 
        employee_id, 
        password, 
        role,
        created_at,
        updated_at
      FROM admin_users 
      WHERE username = ? OR employee_id = ?
    `;
    
    const results = await executeQuery({
      query,
      values: [identifier, identifier]
    });
    
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Database error fetching user:", error);
    return null;
  }
}

// Helper function to update last login time
async function updateLastLogin(userId) {
  try {
    const query = `
      UPDATE admin_users
      SET last_login = CURRENT_TIMESTAMP()
      WHERE id = ?
    `;
    
    await executeQuery({
      query,
      values: [userId]
    });
    
    return true;
  } catch (error) {
    console.error("Error updating last login:", error);
    return false;
  }
}

// Default permissions fallback (in case database role_permissions query fails)
const defaultRolePermissions = {
  superadmin: ['employees_management', 'data_management', 'account_logins', 'attendance_logs', 'role_permissions'],
  admin: ['employees_management', 'data_management', 'account_logins', 'attendance_logs'],
  security: ['attendance_logs'],
  hr: ['attendance_logs', 'employees_management']
};

async function getPermissionsForRole(role) {
  if (role === 'superadmin') {
    return defaultRolePermissions.superadmin;
  }

  try {
    const rows = await executeQuery({
      query: `SELECT module, permission FROM role_permissions WHERE role = ?`,
      values: [role]
    });

    const allowedModules = [];
    rows.forEach(row => {
      let parsed = row.permission;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = {};
        }
      }
      if (parsed?.access === true) {
        allowedModules.push(row.module);
      }
    });

    return allowedModules.length > 0 ? allowedModules : (defaultRolePermissions[role] || []);
  } catch (error) {
    console.error(`Failed to fetch role permissions for role ${role}:`, error);
    return defaultRolePermissions[role] || [];
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Ashima ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        try {
          // Get user from database by username or employee ID
          const user = await getUserByIdentifier(credentials.identifier);
          
          // Check if user exists
          if (!user) {
            return null;
          }
          
          // Validate password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Update last login time
          await updateLastLogin(user.id);
          
          // Return user object (excluding password)
          return {
            id: user.id.toString(),
            name: user.name,
            username: user.username,
            employeeId: user.employee_id,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.employeeId = user.employeeId;
        token.role = user.role;
        token.permissions = await getPermissionsForRole(user.role);
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.employeeId = token.employeeId;
        session.user.role = token.role;
        session.user.permissions = token.permissions || [];
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };