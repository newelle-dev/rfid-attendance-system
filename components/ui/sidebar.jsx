"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3.5rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

const SidebarContext = React.createContext(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const [isMobile, setIsMobile] = React.useState(false)
  const [openMobile, setOpenMobile] = React.useState(false)

  // Internal state when uncontrolled
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp !== undefined ? openProp : _open

  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
      // Save state to document cookie
      if (typeof document !== "undefined") {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      }
    },
    [setOpenProp, open]
  )

  // Track window width for mobile responsiveness
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Toggle helper
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev)
  }, [isMobile, setOpen])

  // Keyboard shortcut Ctrl+B or Cmd+B
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delay={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          }}
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <aside
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col border-r border-sidebar-border",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    )
  }

  if (isMobile) {
    return (
      <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop
            className="fixed inset-0 z-50 bg-black/50 duration-200 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          />
          <DialogPrimitive.Popup
            data-slot="sidebar"
            data-mobile="true"
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex h-full w-[min(calc(100vw-3rem),var(--sidebar-width))] flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out data-open:animate-in data-open:slide-in-from-left-full data-closed:animate-out data-closed:slide-out-to-left-full",
              className
            )}
            {...props}
          >
            {children}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  }

  return (
    <aside
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      className={cn(
        "group hidden md:flex flex-col h-svh sticky top-0 z-30 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear",
        state === "collapsed" && collapsible === "icon"
          ? "w-[var(--sidebar-width-icon)]"
          : "w-[var(--sidebar-width)]",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-8 text-muted-foreground hover:text-foreground", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="size-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 right-0 z-20 hidden w-1.5 -mr-0.5 cursor-ew-resize hover:bg-sidebar-border/80 transition-colors sm:block",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex min-h-svh flex-1 min-w-0 flex-col bg-background transition-all duration-200 ease-linear",
        className
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }) {
  return (
    <header
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-3 border-b border-sidebar-border/60", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }) {
  return (
    <footer
      data-slot="sidebar-footer"
      className={cn("flex flex-col gap-2 p-3 border-t border-sidebar-border/60 mt-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("relative flex w-full min-w-0 flex-col p-1", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/60 outline-none",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("group/menu-item relative list-none", className)}
      {...props}
    />
  )
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  children,
  ...props
}) {
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  const button = (
    <button
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        "peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-lg p-2 text-left text-sm font-medium outline-none transition-colors",
        "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isActive && "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-xs hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
        size === "default" && "h-10 text-sm",
        size === "sm" && "h-8 text-xs",
        size === "lg" && "h-12 text-sm",
        isCollapsed && "size-10 justify-center p-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )

  if (!tooltip || !isCollapsed) {
    return button
  }

  const tooltipText = typeof tooltip === "string" ? tooltip : tooltip.children

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right" align="center">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
}

function SidebarMenuBadge({ className, ...props }) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      className={cn(
        "pointer-events-none absolute right-2 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground/70",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
}
