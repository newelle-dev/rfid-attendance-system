import PageHeader from "@/components/admin/layout/PageHeader";
import EmployeesManagementClient from "@/components/admin/employees/EmployeesManagementClient";
import {
  getEmployeesData,
  getEmployeeStats,
  getEmployeeFilterMetadata,
} from "@/lib/server/employees";

export const metadata = {
  title: "Employees Management",
  description:
    "Manage employee records, RFID credentials, departmental assignments, and personnel status.",
};

/**
 * EmployeesManagementPage (React Server Component)
 *
 * Gold-standard Server Page + Client Island pattern.
 * Concurrent server-side data fetching with zero initial client waterfalls or skeleton flashes.
 */
export default async function EmployeesManagementPage({ searchParams }) {
  const resolvedParams = (await searchParams) || {};
  const page = parseInt(resolvedParams.page || "1", 10);
  const limit = parseInt(resolvedParams.limit || "10", 10);
  const search = resolvedParams.search || "";
  const department = resolvedParams.department || "";
  const position = resolvedParams.position || "";
  const leader = resolvedParams.leader || "";
  const status = resolvedParams.status || "";

  let initialData = {
    employees: [],
    totalEmployees: 0,
    stats: { total: 0, active: 0, inactive: 0, resigned: 0 },
    departments: [],
    positions: [],
    leaders: [],
    error: null,
  };

  try {
    const [employeesResult, stats, metadata] = await Promise.all([
      getEmployeesData({
        page,
        limit,
        search,
        department,
        position,
        leader,
        status,
      }),
      getEmployeeStats(),
      getEmployeeFilterMetadata(),
    ]);

    initialData = {
      employees: employeesResult.data,
      totalEmployees: employeesResult.total,
      stats,
      departments: metadata.departments,
      positions: metadata.positions,
      leaders: metadata.leaders,
      error: null,
    };
  } catch (err) {
    console.error("Failed to load initial employee data on server:", err);
    initialData.error = "Failed to load employee records from database.";
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Breadcrumbs & Clock */}
      <PageHeader />

      {/* Interactive Client Island */}
      <EmployeesManagementClient initialData={initialData} />
    </div>
  );
}