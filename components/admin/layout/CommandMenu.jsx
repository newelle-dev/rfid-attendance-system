"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Database, 
  UserCog, 
  Shield, 
  MonitorPlay,
  ArrowRight
} from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { useRolePermissions } from "@/hooks/useRolePermissions";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const ALL_PAGES = [
  {
    name: "Dashboard",
    description: "System overview, active metrics, and quick statistics",
    href: "/admin",
    icon: LayoutDashboard,
    moduleKey: null,
  },
  {
    name: "Employees Management",
    description: "View and manage employee profiles, RFID tags, and departments",
    href: "/admin/employees-management",
    icon: Users,
    moduleKey: "employees_management",
  },
  {
    name: "Attendance Logs",
    description: "View live punches, timestamps, and export daily log records",
    href: "/admin/attendance-logs",
    icon: Calendar,
    moduleKey: "attendance_logs",
  },
  {
    name: "Data Management",
    description: "Manage department lists, positions, and company roles",
    href: "/admin/lists",
    icon: Database,
    moduleKey: "data_management",
  },
  {
    name: "Account Logins",
    description: "Admin accounts, security credentials, and access passwords",
    href: "/admin/account-logins",
    icon: UserCog,
    moduleKey: "account_logins",
  },
  {
    name: "Role Permissions",
    description: "Role-based access matrix and module security toggles",
    href: "/admin/role-permissions",
    icon: Shield,
    moduleKey: "role_permissions",
  },
  {
    name: "Kiosk Attendance Terminal",
    description: "Launch public attendance scan screen (RFID card tap)",
    href: "/",
    icon: MonitorPlay,
    moduleKey: null,
  },
];

export default function CommandMenu({ className }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();
  const { data: session } = useSession();
  const { permissions } = useRolePermissions();

  // Filter accessible pages based on session & permissions
  const availablePages = React.useMemo(() => {
    const isSuperadmin = session?.user?.role === "superadmin";

    return ALL_PAGES.filter((page) => {
      if (!page.moduleKey) return true; // Universal pages like Dashboard & Kiosk
      if (isSuperadmin) return true;
      if (!permissions) return false;
      return permissions[page.moduleKey]?.access === true;
    });
  }, [session?.user?.role, permissions]);

  // Filter based on user query
  const filteredPages = React.useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return availablePages;
    return availablePages.filter(
      (page) =>
        page.name.toLowerCase().includes(trimmed) ||
        page.description.toLowerCase().includes(trimmed)
    );
  }, [availablePages, query]);

  // Reset selected index when filtered list changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPages]);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = React.useCallback(
    (href) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredPages.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredPages.length - 1) : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredPages[selectedIndex]) {
        handleSelect(filteredPages[selectedIndex].href);
      }
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          "relative h-8 w-full max-w-56 justify-start rounded-lg bg-muted/40 text-xs font-normal text-muted-foreground shadow-2xs hover:bg-muted/80 md:w-56",
          className
        )}
      >
        <Search className="mr-2 size-3.5" />
        <span className="hidden sm:inline-block">Search modules...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      {/* Spotlight Command Dialog */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border border-border bg-background p-0 shadow-2xl duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 overflow-hidden"
          >
            {/* Input bar */}
            <div className="flex items-center border-b border-border px-3 py-2.5">
              <Search className="mr-2.5 size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or jump to page..."
                autoFocus
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              />
              <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border/80 bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* List results */}
            <div className="max-h-72 overflow-y-auto p-2">
              {filteredPages.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No matching modules found.
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="px-2 py-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Navigation & Modules
                  </p>
                  {filteredPages.map((item, index) => {
                    const IconComponent = item.icon;
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleSelect(item.href)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComponent
                            className={cn(
                              "size-4 shrink-0",
                              isSelected ? "text-primary-foreground" : "text-muted-foreground"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium leading-snug">{item.name}</span>
                            <span
                              className={cn(
                                "text-xs line-clamp-1",
                                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}
                            >
                              {item.description}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          className={cn(
                            "size-3.5 opacity-60",
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer helper */}
            <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Navigate <kbd className="font-mono font-semibold">↑</kbd> <kbd className="font-mono font-semibold">↓</kbd></span>
                <span>Select <kbd className="font-mono font-semibold">↵</kbd></span>
              </div>
              <span className="text-muted-foreground/80">RFID Attendance Admin</span>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
