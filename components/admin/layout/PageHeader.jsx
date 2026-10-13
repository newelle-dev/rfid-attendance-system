"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import HeaderClock from "./HeaderClock";
import { cn } from "@/lib/utils";

// Route path to user-friendly title map
const ROUTE_TITLES = {
  "/admin": "Dashboard",
  "/admin/employees-management": "Employees Management",
  "/admin/attendance-logs": "Attendance Logs",
  "/admin/lists": "Data Management",
  "/admin/account-logins": "Account Logins",
  "/admin/role-permissions": "Role Permissions",
};

/**
 * PageHeader Component
 * 
 * Standard page-level top bar containing interactive breadcrumbs on the left
 * and the live server clock pill on the right.
 * 
 * @param {Object} props
 * @param {string} [props.title] - Optional override title
 * @param {Array<{label: string, href?: string}>} [props.breadcrumbs] - Optional custom crumbs
 * @param {string} [props.className]
 */
export default function PageHeader({ title, breadcrumbs, className }) {
  const pathname = usePathname();

  const activeTitle = title || ROUTE_TITLES[pathname] || "Admin Portal";
  const isRootDashboard = pathname === "/admin";

  return (
    <div
      data-slot="page-header"
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4",
        className
      )}
    >
      {/* Breadcrumb Trail */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs ? (
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label || idx}>
                {idx > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {crumb.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))
          ) : isRootDashboard ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">
                Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground">
                  {activeTitle}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Live Server Clock Pill Badge */}
      <HeaderClock variant="desktop" />
    </div>
  );
}
