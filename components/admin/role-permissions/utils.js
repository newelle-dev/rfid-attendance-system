import { ROLES, MODULES, PROTECTED_PERMISSIONS, RECOMMENDED_BASELINE } from "./constants";

/**
 * Get role specification by value
 * @param {string} role - Role key
 * @returns {Object|undefined}
 */
const getRoleInfo = (role) => {
  return ROLES.find((r) => r.value === role);
};

/**
 * Get module specification by value
 * @param {string} moduleName - Module key
 * @returns {Object|undefined}
 */
const getModuleInfo = (moduleName) => {
  return MODULES.find((m) => m.value === moduleName);
};

/**
 * Check if a permission is permanently locked / protected from modification
 * @param {string} role
 * @param {string} moduleName
 * @returns {boolean}
 */
export const isProtectedPermission = (role, moduleName) => {
  return PROTECTED_PERMISSIONS.some((p) => p.role === role && p.module === moduleName);
};

/**
 * Normalizes any raw DB permission dataset into a complete 4x5 canonical matrix (20 items).
 * Guarantees no missing cells or undefined access states.
 * 
 * @param {Array} rawPermissions - Raw permissions array from database
 * @returns {Array} Exactly 20 normalized permission objects
 */
export const normalizePermissions = (rawPermissions = []) => {
  const permMap = new Map();

  // Index existing records
  if (Array.isArray(rawPermissions)) {
    for (const p of rawPermissions) {
      if (!p || !p.role || !p.module) continue;
      const parsedAccess = Boolean(
        typeof p.permission === "object" && p.permission !== null
          ? p.permission.access
          : false
      );
      permMap.set(`${p.role}:${p.module}`, parsedAccess);
    }
  }

  const normalized = [];

  for (const role of ROLES) {
    for (const mod of MODULES) {
      const key = `${role.value}:${mod.value}`;
      let access = false;

      if (permMap.has(key)) {
        access = permMap.get(key);
      } else if (role.value === "superadmin") {
        access = true;
      }

      // Root invariant: Superadmin role_permissions is always true
      if (role.value === "superadmin" && mod.value === "role_permissions") {
        access = true;
      }

      normalized.push({
        role: role.value,
        module: mod.value,
        permission: { access }
      });
    }
  }

  return normalized;
};

/**
 * Constructs the canonical baseline permission set (20 items)
 * @returns {Array}
 */
export const getBaselinePermissions = () => {
  const baseline = [];

  for (const role of ROLES) {
    const allowedModules = RECOMMENDED_BASELINE[role.value] || [];
    for (const mod of MODULES) {
      const access = allowedModules.includes(mod.value);
      baseline.push({
        role: role.value,
        module: mod.value,
        permission: { 
          access: (role.value === "superadmin" && mod.value === "role_permissions") ? true : access 
        }
      });
    }
  }

  return baseline;
};

/**
 * Calculate role statistics including module coverage and percentage
 * @param {Array} permissions - Normalized permissions
 * @param {string} role - Role value
 * @returns {Object}
 */
export const calculateRoleStats = (permissions = [], role) => {
  const rolePermissions = permissions.filter((p) => p.role === role);
  const accessibleModules = rolePermissions.filter((p) => p.permission?.access).length;
  const totalModules = MODULES.length;

  return {
    totalModules,
    accessibleModules,
    accessPercentage: totalModules > 0 ? Math.round((accessibleModules / totalModules) * 100) : 0
  };
};

/**
 * Determine differences between current permissions and original committed permissions
 * @param {Array} current
 * @param {Array} original
 * @returns {Array<{ role: string, module: string, from: boolean, to: boolean }>}
 */
export const getModifiedPermissions = (current = [], original = []) => {
  const originalMap = new Map(
    original.map((p) => [`${p.role}:${p.module}`, Boolean(p.permission?.access)])
  );

  const diffs = [];
  for (const p of current) {
    const orig = originalMap.get(`${p.role}:${p.module}`);
    const curr = Boolean(p.permission?.access);
    if (orig !== undefined && orig !== curr) {
      diffs.push({
        role: p.role,
        module: p.module,
        from: orig,
        to: curr
      });
    }
  }

  return diffs;
};

/**
 * Check if a single cell has an unsaved modification
 * @param {Array} modifiedList
 * @param {string} role
 * @param {string} moduleName
 * @returns {boolean}
 */
export const isCellModified = (modifiedList = [], role, moduleName) => {
  return modifiedList.some((d) => d.role === role && d.module === moduleName);
};

/**
 * Exports current RBAC policy matrix as a downloadable CSV
 * @param {Array} permissions - Permissions dataset
 */
export const exportPermissionsCsv = (permissions = []) => {
  const headers = ["Role Key", "Role Title", "Module Key", "Module Title", "Category", "Access Status", "Protected Rule"];
  
  const rows = permissions.map((p) => {
    const role = getRoleInfo(p.role);
    const modDef = getModuleInfo(p.module);
    const isProtected = isProtectedPermission(p.role, p.module);
    const hasAccess = Boolean(p.permission?.access);

    return [
      `"${p.role}"`,
      `"${role?.label || p.role}"`,
      `"${p.module}"`,
      `"${modDef?.label || p.module}"`,
      `"${modDef?.category || 'Core'}"`,
      `"${hasAccess ? 'GRANTED' : 'DENIED'}"`,
      `"${isProtected ? 'YES' : 'NO'}"`
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  
  link.setAttribute("href", url);
  link.setAttribute("download", `rbac_matrix_policy_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
