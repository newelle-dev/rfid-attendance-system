/**
 * Account roles available in the system with metadata and UI descriptors
 */
export const ACCOUNT_ROLES = [
  {
    id: "superadmin",
    name: "Super Admin",
    description: "Unrestricted master system access, role authority, and administrative overrides.",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Operational management of employee records, organization lists, and attendance rosters.",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  {
    id: "security",
    name: "Security",
    description: "Kiosk terminal oversight, physical RFID gate management, and live attendance punch feed.",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  {
    id: "hr",
    name: "HR Manager",
    description: "Employee onboarding, department hierarchy, attendance audit logs, and reports.",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
];

/**
 * Standard page size options
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * Role lookup helper
 */
export const getRoleMeta = (roleId) => {
  return (
    ACCOUNT_ROLES.find((r) => r.id === roleId) || {
      id: roleId,
      name: roleId || "Unknown",
      description: "Standard account privileges",
      badgeClass: "bg-muted text-muted-foreground border-border/80",
      dotClass: "bg-muted-foreground",
    }
  );
};