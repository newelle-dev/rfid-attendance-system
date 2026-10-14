# Admin Layout & Spacing Standards

This rule governs layout architecture, container spacing, and page composition across the authenticated Admin Portal (`app/admin/(root)/*`). All agents and developers must strictly adhere to these standards to ensure visual consistency and prevent layout regressions.

---

## 1. Centralized Layout Container

The root admin layout (`app/admin/(root)/layout.js`) is the **sole authority** over the outer viewport width, horizontal padding, and vertical rhythm.

```jsx
<SidebarProvider defaultOpen={defaultOpen}>
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
```

### Invariant Rules
- **Never Double-Nest Containers**: Pages under `app/admin/(root)/*` must **NEVER** declare `container`, `mx-auto`, `max-w-*`, `px-*`, or `py-*` on their root wrapper.
- **Root Element Rule**: Every admin page root element must be strictly `<div className="space-y-6">` (or wrapped in `<PermissionGuard><div className="space-y-6">...</div></PermissionGuard>`).
- **Semantic Color Tokens Only**: Use semantic tokens (`bg-muted/20`, `bg-background`, `border-border/80`, `text-foreground`, `text-muted-foreground`). Never use ad-hoc color classes like `bg-slate-50/60` or hardcoded color palettes.

---

## 2. Standard 4-Tier Page Architecture

Every page in the admin portal must follow this uniform top-to-bottom layout hierarchy:

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 1: PageHeader (Breadcrumbs + Live Server Clock)        │
├─────────────────────────────────────────────────────────────┤
│ Tier 2: Page Command Header (H1 Title + Action Buttons)     │
├─────────────────────────────────────────────────────────────┤
│ Tier 3: KPI Metrics Strip (4-State or 3-State Card Grid)    │
├─────────────────────────────────────────────────────────────┤
│ Tier 4: Main Workspace Card (Toolbar + Table + Pagination)  │
└─────────────────────────────────────────────────────────────┘
```

### Tier 1: System Context & Breadcrumbs (`<PageHeader />`)
- Contains interactive breadcrumbs on the left and the live synchronized server clock pill on the right.
- Spacing: `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-0.5`. No heavy bottom padding; vertical spacing is handled cleanly by the parent `space-y-6`.

### Tier 2: Page Command Header
- Left side: Page H1 title (`text-xl font-semibold tracking-tight text-foreground`) and descriptive subtitle (`text-xs text-muted-foreground mt-0.5`).
- Right side: Standardized action buttons (`h-8 text-xs gap-1.5`): Export CSV, Refresh, or primary CTA button (e.g., `Add Employee`).

### Tier 3: KPI Metrics Strip
- Responsive metric grid: `grid grid-cols-2 lg:grid-cols-4 gap-3`.
- Cards: Minimalist flat border (`border-border/80 bg-card hover:bg-muted/40`), compact text, status indicator dot, and interactive click-to-filter capability where applicable.

### Tier 4: Main Data Workspace Card
- Enclosed in `<Card className="border-border/80 shadow-xs">` with `<CardContent className="p-4 sm:p-5 space-y-4">`.
- Contains:
  1. **Inline Faceted Toolbar**: Search input with clear button, dropdown select pills for filters, active filter chips, and Reset button.
  2. **High-Density Data Table**: Sticky header (`bg-muted/30`), compact cell padding (`py-2.5 px-3`), avatar initials fallback, monospace ID & RFID badges, status dot, and 3-dots row actions dropdown.
  3. **Pagination Footer**: Row range counter, page-size selector (10, 25, 50, 100), and previous/next page navigation buttons.

---

## 3. Slide-Over Sheet Standard for Details & Forms

- For deep inspection (dossiers) or create/edit workflows, use the slide-over `<Sheet>` primitive (`components/ui/sheet.jsx`) instead of centered modal dialogs.
- This preserves the table's scroll position and pagination context while providing a focused, non-disruptive workspace.
- Deletions must always use the standard `<DeleteConfirmationDialog>` with explicit consequences listed.
