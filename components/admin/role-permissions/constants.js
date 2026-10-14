import { 
  Users, 
  Database, 
  CalendarCheck, 
  UserCog, 
  Shield, 
  ShieldAlert, 
  ShieldCheck 
} from "lucide-react";

/**
 * Certified Roles definitions for RBAC governance
 */
export const ROLES = [
  { 
    value: "superadmin", 
    label: "Super Admin", 
    color: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400",
    dotColor: "bg-rose-500",
    icon: ShieldAlert,
    description: "Root administrative authority with unrestricted access to all system modules and security policies."
  },
  { 
    value: "admin", 
    label: "Admin", 
    color: "bg-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400",
    dotColor: "bg-blue-500",
    icon: Shield,
    description: "Operational administrator managing staff records, departmental data, credentials, and daily logs."
  },
  { 
    value: "security", 
    label: "Security", 
    color: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
    icon: ShieldCheck,
    description: "Kiosk and on-premise security staff with real-time attendance scan verification privileges."
  },
  { 
    value: "hr", 
    label: "HR", 
    color: "bg-violet-500",
    badgeClass: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400",
    dotColor: "bg-violet-500",
    icon: Users,
    description: "Human resources personnel managing employee rosters, department allocations, and punch records."
  }
];

/**
 * System Modules managed under RBAC policy
 */
export const MODULES = [
  { 
    value: "employees_management", 
    label: "Employees Management", 
    description: "Employee records, RFID card assignment, biometric profile, and employment status",
    category: "Core",
    href: "/admin/employees-management",
    icon: Users
  },
  { 
    value: "data_management", 
    label: "Data Management", 
    description: "Organizational departments, position titles, and supervisory hierarchy structures",
    category: "Core",
    href: "/admin/lists",
    icon: Database
  },
  { 
    value: "attendance_logs", 
    label: "Attendance Logs", 
    description: "RFID terminal timestamp history, daily check-ins, breaks, and punch records",
    category: "Core",
    href: "/admin/attendance-logs",
    icon: CalendarCheck
  },
  { 
    value: "account_logins", 
    label: "Account Logins", 
    description: "Administrative staff logins, role assignments, and privileged credential control",
    category: "Admin",
    href: "/admin/account-logins",
    icon: UserCog
  },
  { 
    value: "role_permissions", 
    label: "Role Permissions", 
    description: "Global role-based access control policies, security matrix, and permission overrides",
    category: "Admin",
    href: "/admin/role-permissions",
    icon: Shield
  }
];

/**
 * Filter categories for matrix and cards
 */
export const MODULE_CATEGORIES = [
  { value: "all", label: "All Modules" },
  { value: "Core", label: "Core Operations" },
  { value: "Admin", label: "Governance & Admin" }
];

/**
 * Recommended system security baseline aligned with proxy.js
 */
export const RECOMMENDED_BASELINE = {
  superadmin: ["employees_management", "data_management", "account_logins", "attendance_logs", "role_permissions"],
  admin: ["employees_management", "data_management", "account_logins", "attendance_logs"],
  security: ["attendance_logs"],
  hr: ["employees_management", "attendance_logs"]
};

/**
 * Permanently protected permissions that cannot be toggled off or revoked
 */
export const PROTECTED_PERMISSIONS = [
  { role: "superadmin", module: "role_permissions" }
];
