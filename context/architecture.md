# Architecture

## Directory Structure

```
rfid-attendance-system/
├── app/                                  # Next.js 16 App Router
│   ├── layout.js                         # Root HTML layout (fonts, metadata)
│   ├── page.js                           # Kiosk attendance terminal (RFID HID scan & punch feedback)
│   ├── globals.css                       # Global styles & Tailwind CSS 4 theme tokens
│   ├── admin/
│   │   ├── layout.js                     # Root admin server layout with metadata
│   │   ├── AdminProviders.jsx            # Client boundary for SessionProvider & ThemeProvider
│   │   ├── login/                        # Admin credentials login page
│   │   │   └── page.js
│   │   └── (root)/                       # Authenticated admin portal shell (route group)
│   │       ├── layout.js                 # Centralized shell (SidebarProvider, SideNav, Header, Toaster)
│   │       ├── loading.js                # Instant route transition fallback
│   │       ├── page.js                   # Dashboard overview & real-time activity feed
│   │       ├── employees-management/     # React Server Component for employee management
│   │       │   └── page.js
│   │       ├── attendance-logs/          # Daily attendance logs & punch history viewer
│   │       │   └── page.js
│   │       ├── lists/                    # Department & Position management
│   │       │   └── page.js
│   │       ├── account-logins/           # Admin user accounts & credential management
│   │       │   └── page.js
│   │       └── role-permissions/         # Role-based access control matrix
│   │           └── page.js
│   └── api/
│       ├── auth/                         # NextAuth [...nextauth] route handler
│       ├── attendance/                   # Public kiosk attendance endpoints
│       │   ├── add/                      # POST — record IN / OUT punch
│       │   └── logs/                     # GET — fetch public punch log
│       └── admin/                        # Protected admin REST endpoints (requireAdminSession)
│           ├── accounts/                 # Admin user CRUD
│           ├── attendance-logs/          # Attendance logs retrieval & filtering
│           ├── dashboard/                # Aggregated metrics & activity feeds
│           ├── departments/              # Department CRUD & AUTO_INCREMENT ID handling
│           ├── employees/                # Employee CRUD & photo processing
│           ├── leaders/                  # Direct supervisor lookup
│           ├── lists/stats/              # Department & position counts
│           ├── positions/                # Position CRUD & leadership flag
│           ├── profile/                  # Admin profile details
│           └── role-permissions/         # Permission CRUD & role-based matrix
├── components/
│   ├── Clock.js                          # Real-time clock for kiosk terminal
│   ├── admin/                            # Domain-specific admin portal components
│   │   ├── accounts/                     # User table, account drawer forms, dialogs
│   │   ├── attendance/                   # Attendance table, date filters, punch badges
│   │   ├── dashboard/                    # Overview KPI cards, quick actions, punch feed
│   │   ├── employees/                    # Server client wrapper, employee table, dossier Sheet
│   │   ├── layout/                       # AdminProviders, Header, HeaderClock, NavUser, PageHeader, SideNav, CommandMenu
│   │   ├── lists/                        # Department & position management tables & dialogs
│   │   └── role-permissions/             # Matrix view, role selector, permission toggles
│   ├── auth/                             # LoginForm, PasswordInput, PermissionGuard, LogoutConfirmationDialog
│   ├── layout/home/                      # Kiosk components: EmployeeCard, EmployeePhoto, ErrorDisplay
│   └── ui/                               # Base UI primitives (Base UI & Radix primitives, DeleteConfirmationDialog)
├── hooks/                                # Custom React hooks
│   ├── useAccountLogins.js               # Admin account state & operations
│   ├── useAnimation.js                   # Animation helpers
│   ├── useAttendance.js                  # RFID scan state machine & audio triggers
│   ├── useAttendanceLogsManager.js       # Attendance logs state & filtering
│   ├── useAuth.js                        # Client session hook
│   ├── useDataManagement.js              # Departments & positions state
│   ├── useEmployeesManager.js            # Employee mutations & client state
│   ├── useRolePermissions.js             # Role permission fetching
│   └── useRolePermissionsManager.js      # Role permission matrix mutations
├── lib/
│   ├── auth.js                           # requireAdminSession route guard helper
│   ├── db.js                             # mysql2 connection pool & executeQuery helper
│   ├── HIDListeners.js                   # Hardware RFID HID keyboard event listener
│   ├── utils.js                          # cn() class merge helper (clsx + tailwind-merge)
│   ├── server/                           # React Server Component data loaders
│   │   └── employees.js                  # getEmployeesData, getEmployeeStats, getEmployeeFilterMetadata
│   └── validations/                      # Centralized Zod request schemas
│       ├── accounts.js                   # Account create/update schemas
│       ├── auth.js                       # Login & credential schemas
│       ├── employees.js                  # Employee create/update schemas
│       ├── lists.js                      # Department & position schemas
│       └── index.js
├── constants/
│   ├── accountConstants.js               # Account role definitions
│   ├── auth.js                           # Auth labels and defaults
│   └── index.js                          # General settings and timeouts
├── utils/
│   └── dateUtils.js                      # Standardized dayjs date/time formatters
├── databases/                            # SQL schemas, dumps, and migrations
│   ├── schema.sql                        # Full relational schema
│   ├── rfid_attendance.sql               # Active database dump
│   ├── migration.sql                     # Schema migration scripts
│   ├── dev-setup.sql                     # Development seed data
│   ├── role_permissions.sql              # Permission table seed
│   └── migrate_to_access_only.sql        # Permission structure migration
├── scripts/
│   └── seed-admin-users.js               # Seed script for default admin credentials
├── proxy.js                              # Next.js 16 session proxy & route authorization
├── package.json
├── next.config.mjs
└── postcss.config.mjs
```

---

## Request Flow

### 1. RFID Hardware Scan Flow (Public Kiosk)
```
RFID Card Tap
  → USB Reader sends keystrokes with 'Enter' (HID keyboard mode)
  → lib/HIDListeners.js (filters out active INPUT/TEXTAREA/SELECT/contenteditable)
  → hooks/useAttendance captures RFID tag
  → POST /api/attendance/add { rfid_tag }
  → lib/db.js executeQuery() → lookup employee by rfid_tag
  → Check last log in attendance_logs for this employee:
      • If no log, or last log is 'OUT', or last 'IN' is already paired:
          → INSERT new record with log_type = 'IN', in_time = NOW(), out_time = NULL
      • If last log is 'IN' with out_time NULL:
          → UPDATE record with log_type = 'OUT', out_time = NOW()
  → Update employee status & last_active timestamp
  → Return employee details + updated log entry
  → UI: renders EmployeeCard + sound feedback via use-sound
  → Error/Banner auto-dismisses after 4 seconds
```

### 2. Admin Portal Navigation Flow
```
Browser navigates to /admin/{subpage}
  → proxy.js (Next.js 16 Proxy Middleware)
      1. Pass through /admin/login and /api/* immediately
      2. Extract JWT via getToken({ req, secret: NEXTAUTH_SECRET })
      3. If no token → redirect to /admin/login
      4. Inspect token.role:
          • 'superadmin' → allow all routes
      5. Inspect token.permissions array (embedded directly in JWT on sign-in):
          • Check if module mapped in routeModuleMap is allowed
          • If forbidden → redirect to /admin
  → Server Layout: app/admin/layout.js
      → AdminProviders (SessionProvider, ThemeProvider)
      → (root)/layout.js (SidebarProvider, SideNav, Header, Page wrapper)
  → Page Component:
      • Server Component (e.g., employees-management/page.js):
          Fetches data concurrently via lib/server/ (getEmployeesData, getEmployeeStats)
          Streams server-rendered HTML with zero initial client waterfall
          Hydrates interactive island (EmployeesManagementClient)
      • Client Component (e.g., lists/page.js, attendance-logs/page.js):
          Wrapped with <PermissionGuard module="...">
          Calls custom hook (useDataManagement, useAttendanceLogsManager)
          Fetches from protected /api/admin/{resource}
```

### 3. Protected Admin API Flow
```
Client fetch() to /api/admin/{resource}
  → Route Handler (app/api/admin/{resource}/route.js)
  → requireAdminSession(allowedRoles) in lib/auth.js:
      1. Reads session via getServerSession(authOptions)
      2. If no session → returns 401 Unauthorized
      3. If role not in allowedRoles (and not 'superadmin') → returns 403 Forbidden
  → Next.js 16 dynamic route params awaited: const { id } = await context.params;
  → Request payload parsed and validated via Zod schema (lib/validations/)
  → Parameterized query executed via executeQuery({ query, values }) in lib/db.js
  → Response returned as NextResponse.json({ ... })
```

---

## Authentication Architecture

- **Engine**: NextAuth.js v4 with `CredentialsProvider`.
- **Strategy**: Stateless JWT (`strategy: 'jwt'`), session validity 8 hours.
- **Identifier**: Login accepts either `username` or `employee_id` (Ashima ID).
- **Password Hashing**: `bcryptjs` (passwords are never saved in plaintext).
- **JWT Callback**: During authentication, permissions for the user's role are retrieved from `role_permissions` and attached directly to `token.permissions`.
- **Session Callback**: Passes `id`, `username`, `employeeId`, `role`, and `permissions` to `session.user`.
- **Route Proxy**: `proxy.js` guards incoming administrative requests using `getToken()` without external loopback HTTP requests.

---

## Permission System

The system implements a 3-tier defense-in-depth authorization model:

1. **Proxy Layer (`proxy.js`)**:
   - Intercepts requests before Next.js page rendering.
   - Evaluates `token.permissions` against `routeModuleMap`.
   - Denied users are redirected to `/admin` with zero information leakage.

2. **API Endpoint Layer (`lib/auth.js`)**:
   - Every handler in `app/api/admin/*` begins with `requireAdminSession(allowedRoles)`.
   - Rejects unauthenticated requests with `401 Unauthorized`.
   - Rejects unauthorized roles with `403 Forbidden`.

3. **Client UI Layer (`components/auth/PermissionGuard.jsx`)**:
   - Admin subpages wrap their views in `<PermissionGuard module="...">`.
   - Renders a clean access-denied state if permissions are revoked, hiding unauthorized actions and buttons.
   - Navigation links in `<SideNav />` and items in `<CommandMenu />` are dynamically filtered based on session permissions.

---

## Data Layer & Performance

- **Connection Pool**: Single `mysql2/promise` connection pool initialized in `lib/db.js` (max 10 connections).
- **Parameterized Queries**: All queries execute through `executeQuery({ query, values })` to eliminate SQL injection vulnerabilities.
- **Server Component Preloading**: Core admin modules use Server Components (`lib/server/`) to prefetch table data, metadata, and KPI metrics on the server concurrently via `Promise.all()`, eliminating client waterfall requests.
- **Client Islands**: Heavy interactive elements (filters, modals, drawers, search inputs) are scoped as Client Components (`"use client"`) that receive initial data via props.

---

## Design System & Layout Standards

All pages in `app/admin/(root)/*` adhere strictly to the 4-tier layout architecture:
1. **Tier 1 (`PageHeader`)**: Interactive breadcrumbs on the left, synchronized server clock on the right.
2. **Tier 2 (Command Header)**: Page H1 title, subtitle, and primary actions (Export CSV, Add Record).
3. **Tier 3 (KPI Strip)**: Flat-bordered summary metric cards with status indicator dots and click-to-filter capability.
4. **Tier 4 (Main Workspace Card)**: Search input, faceted filter dropdowns, high-density table, and pagination controls.
- **Outer Shell Padding**: Centralized in `app/admin/(root)/layout.js` (`px-4 sm:px-6 lg:px-8 py-6`). Individual pages must never declare outer `container`, `mx-auto`, or padding.
- **Drawer Primitives**: Complex form editing and detailed record dossiers use slide-over `<Sheet>` components (`components/ui/sheet.jsx`) to preserve table scroll position.
- **Destructive Actions**: Always confirmed via `<DeleteConfirmationDialog>`.
