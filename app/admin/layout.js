import AdminProviders from "@/components/admin/layout/AdminProviders";

export const metadata = {
  title: {
    template: "%s | RFID Attendance Admin",
    default: "Admin Portal | RFID Attendance System",
  },
  description: "Administrative control portal for RFID attendance, employee records, and system permissions.",
};

/**
 * Root Admin Portal Layout (React Server Component)
 * Provides server-level metadata and delegates client providers to AdminProviders.
 */
export default function AdminLayout({ children }) {
  return (
    <AdminProviders>
      {children}
    </AdminProviders>
  );
}