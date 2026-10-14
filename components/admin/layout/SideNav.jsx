"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Shield,
  Database
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import NavUser from "./NavUser";
import SideNavSkeleton from "./SideNavSkeleton";
import { cn } from "@/lib/utils";

// Universal Dashboard navigation item for all authenticated admin users
const DASHBOARD_ITEM = {
  name: "Dashboard",
  href: "/admin",
  icon: LayoutDashboard,
};

// Module definitions with their corresponding routes and icons
const MODULE_DEFINITIONS = {
  employees_management: {
    name: "Employees Management",
    href: "/admin/employees-management",
    icon: Users,
  },
  attendance_logs: {
    name: "Attendance Logs",
    href: "/admin/attendance-logs",
    icon: Calendar,
  },
  data_management: {
    name: "Data Management",
    href: "/admin/lists",
    icon: Database,
  },
  account_logins: {
    name: "Account Logins",
    href: "/admin/account-logins",
    icon: UserCog,
  },
  role_permissions: {
    name: "Role Permissions",
    href: "/admin/role-permissions",
    icon: Shield,
  },
};

export default function SideNav({ className }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { permissions, loading: permissionsLoading } = useRolePermissions();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const isLoading = (status === "loading" && !session) || (permissionsLoading && !permissions);

  // Build navigation items based on permissions
  const navItems = React.useMemo(() => {
    if (!session?.user?.role) return [];

    let items = [];
    if (permissions) {
      const allowed = Object.entries(MODULE_DEFINITIONS)
        .filter(([moduleKey]) => permissions[moduleKey]?.access)
        .map(([, moduleInfo]) => moduleInfo);

      if (session.user.role === "superadmin" && allowed.length === 0) {
        items = Object.values(MODULE_DEFINITIONS);
      } else {
        items = allowed;
      }
    } else if (session.user.role === "superadmin") {
      items = Object.values(MODULE_DEFINITIONS);
    }

    // Always include Dashboard as the first item for any authenticated user
    return [DASHBOARD_ITEM, ...items];
  }, [permissions, session?.user?.role]);

  if (isLoading) {
    return <SideNavSkeleton />;
  }

  return (
    <Sidebar collapsible="icon" className={className}>
      {/* Brand Header */}
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border px-3">
        <Link
          href="/admin"
          className="flex w-full items-center justify-center gap-2.5 rounded-lg py-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {isCollapsed ? (
            <div className="relative size-8 shrink-0 overflow-hidden">
              <Image
                src="/ew-logo-compact.png"
                alt="EastWest BPO"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="relative h-10 w-full max-w-[190px]">
              <Image
                src="/ew-logo-full.png"
                alt="EastWest BPO MCI"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* Navigation Content (Single Flat List) */}
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.name}>
                <Link href={item.href} className="w-full block">
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.name}
                    className="w-full"
                  >
                    <Icon className="size-4.5 shrink-0" />
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter>
        <NavUser session={session} />
      </SidebarFooter>

      {/* Draggable/Clickable Rail */}
      <SidebarRail />
    </Sidebar>
  );
}