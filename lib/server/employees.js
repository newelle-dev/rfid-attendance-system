import { executeQuery } from "@/lib/db";

/**
 * Data Access Layer (DAL) for Employee Operations (Server-Side)
 * Executes parameterized queries against MySQL and provides formatted records
 * for both Server Components during SSR and API route handlers.
 */

/**
 * Fetches paginated employee records with search and faceted filters.
 *
 * @param {Object} params
 * @param {number|string} [params.page=1]
 * @param {number|string} [params.limit=10]
 * @param {string} [params.search=""]
 * @param {string} [params.department=""]
 * @param {string} [params.position=""]
 * @param {string} [params.leader=""]
 * @param {string} [params.status=""]
 * @returns {Promise<{ data: Array, total: number, page: number, limit: number, totalPages: number }>}
 */
export async function getEmployeesData({
  page = 1,
  limit = 10,
  search = "",
  department = "",
  position = "",
  leader = "",
  status = "",
} = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (safePage - 1) * safeLimit;

  // Dynamic parameterized WHERE clause
  const whereConditions = ["(e.ashima_id LIKE ? OR e.name LIKE ?)"];
  const filterValues = [`%${search}%`, `%${search}%`];

  if (department) {
    whereConditions.push("d.id = ?");
    filterValues.push(department);
  }
  if (position) {
    whereConditions.push("p.id = ?");
    filterValues.push(position);
  }
  if (leader) {
    whereConditions.push("l.id = ?");
    filterValues.push(leader);
  }
  if (status) {
    whereConditions.push("e.status = ?");
    filterValues.push(status);
  }

  const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

  const dataQuery = `
    SELECT 
      e.id, e.ashima_id, e.name, 
      d.name AS department, p.name AS position, 
      l.name AS leader_name,
      e.rfid_tag, e.photo, e.emp_stat, e.status,
      e.department_id, e.position_id, e.leader
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    LEFT JOIN employees l ON e.leader = l.id 
    ${whereClause}
    ORDER BY e.id DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN positions p ON e.position_id = p.id
    LEFT JOIN employees l ON e.leader = l.id
    ${whereClause}
  `;

  const [employees, countResult] = await Promise.all([
    executeQuery({
      query: dataQuery,
      values: [...filterValues, safeLimit, offset],
    }),
    executeQuery({
      query: countQuery,
      values: filterValues,
    }),
  ]);

  const formattedEmployees = (employees || []).map((emp) => ({
    ...emp,
    photo: emp.photo
      ? `data:image/jpeg;base64,${Buffer.from(emp.photo).toString("base64")}`
      : null,
  }));

  const total = Number(countResult?.[0]?.total || 0);

  return {
    data: formattedEmployees,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

/**
 * Fetches headcount KPI metrics for total, active, inactive, and resigned employees.
 *
 * @returns {Promise<{ total: number, active: number, inactive: number, resigned: number }>}
 */
export async function getEmployeeStats() {
  const totalQuery = `SELECT COUNT(*) AS total FROM employees`;
  const activeQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'active'`;
  const inactiveQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'inactive'`;
  const resignedQuery = `SELECT COUNT(*) AS total FROM employees WHERE status = 'resigned'`;

  const [[totalRes], [activeRes], [inactiveRes], [resignedRes]] = await Promise.all([
    executeQuery({ query: totalQuery }),
    executeQuery({ query: activeQuery }),
    executeQuery({ query: inactiveQuery }),
    executeQuery({ query: resignedQuery }),
  ]);

  return {
    total: Number(totalRes?.total || 0),
    active: Number(activeRes?.total || 0),
    inactive: Number(inactiveRes?.total || 0),
    resigned: Number(resignedRes?.total || 0),
  };
}

/**
 * Concurrently queries metadata lists for departments, positions, and active leaders.
 *
 * @returns {Promise<{ departments: Array, positions: Array, leaders: Array }>}
 */
export async function getEmployeeFilterMetadata() {
  const deptQuery = `SELECT id, name FROM departments ORDER BY name ASC`;
  const posQuery = `SELECT id, name, is_leader FROM positions ORDER BY name ASC`;
  const leadQuery = `
    SELECT 
      e.id, 
      e.name, 
      e.ashima_id,
      p.name AS position_name,
      d.name AS department_name
    FROM employees e
    JOIN positions p ON e.position_id = p.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE p.is_leader = 1 AND e.status = 'active'
    ORDER BY e.name ASC
  `;

  const [departments, positions, leaders] = await Promise.all([
    executeQuery({ query: deptQuery }),
    executeQuery({ query: posQuery }),
    executeQuery({ query: leadQuery }),
  ]);

  return {
    departments: departments || [],
    positions: positions || [],
    leaders: leaders || [],
  };
}
