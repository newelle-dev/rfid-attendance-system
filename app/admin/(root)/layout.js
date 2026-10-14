import { cookies } from "next/headers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SideNav from "@/components/admin/layout/SideNav";
import Header from "@/components/admin/layout/Header";
import { Toaster } from "@/components/ui/sonner";

/**
 * Root Admin Portal Layout (React Server Component)
 * Streams the admin navigation shell and page content together during SSR.
 */
export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const sidebarCookie = cookieStore.get("sidebar_state");
  const defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* WCAG 2.1 AA Accessible Skip-to-Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring focus:rounded-md focus:shadow-lg focus:outline-none text-xs font-medium"
      >
        Skip to main content
      </a>

      <SideNav />
      <SidebarInset className="min-h-screen bg-muted/20 dark:bg-background flex flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full outline-none">
          <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </SidebarInset>
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </SidebarProvider>
  );
}