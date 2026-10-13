"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, ChevronsUpDown, ShieldCheck } from "lucide-react";
import { getFirstName } from "@/utils/dateUtils";
import { useSidebar } from "@/components/ui/sidebar";
import LogoutConfirmationDialog from "@/components/auth/LogoutConfirmationDialog";
import ProfileDialog from "@/components/profile/ProfileDialog";
import { cn } from "@/lib/utils";

export default function NavUser({ session }) {
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [showProfileDialog, setShowProfileDialog] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  const { isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  if (!session) return null;

  const userInfo = {
    name: session?.user?.name || "Unknown User",
    email: session?.user?.email || "",
    image: session?.user?.image,
    initial: session?.user?.name?.[0]?.toUpperCase() || "U",
    role: session?.user?.role || "user",
    firstName: getFirstName(session?.user?.name || "Unknown"),
  };

  const formattedRole =
    userInfo.role === "superadmin"
      ? "Super Admin"
      : userInfo.role === "hr"
        ? "HR Admin"
        : userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1);

  const handleProfileDialogClose = (open) => {
    setShowProfileDialog(open);
    if (!open && triggerRef.current) {
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    }
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger
          render={
            <button
              ref={triggerRef}
              data-slot="nav-user-trigger"
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm outline-none transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isCollapsed && "justify-center p-0 size-10"
              )}
            />
          }
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarImage src={userInfo.image} alt={userInfo.name} />
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
              {userInfo.initial}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium text-sidebar-foreground">
                {userInfo.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {formattedRole}
              </span>
            </div>
          )}

          {!isCollapsed && (
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/80 group-hover:text-sidebar-foreground transition-colors" />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-60 min-w-56 rounded-lg shadow-xl"
          side={isMobile ? "bottom" : isCollapsed ? "right" : "top"}
          align={isCollapsed ? "start" : "end"}
          sideOffset={8}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-2 text-left text-sm">
                <Avatar className="size-9 rounded-lg">
                  <AvatarImage src={userInfo.image} alt={userInfo.name} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-semibold text-xs">
                    {userInfo.initial}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    {userInfo.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userInfo.email || "No email"}
                  </span>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-3" />
                    <span>{formattedRole}</span>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setShowProfileDialog(true);
              setDropdownOpen(false);
            }}
            className="cursor-pointer"
          >
            <User className="mr-2 size-4 text-muted-foreground" />
            <span>Profile Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* System Version & Copyright */}
          <div className="px-3 py-1.5 text-[11px] text-muted-foreground/80">
            <p className="font-semibold text-foreground/80">RFID Attendance System</p>
            <p className="text-[10px]">v2.0.0 &bull; &copy; {new Date().getFullYear()} EastWest BPO</p>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setShowLogoutDialog(true);
              setDropdownOpen(false);
            }}
            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <LogOut className="mr-2 size-4 text-destructive" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
      />

      {/* Profile Dialog */}
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={handleProfileDialogClose}
      />
    </>
  );
}
