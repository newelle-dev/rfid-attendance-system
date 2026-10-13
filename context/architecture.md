# Architecture

## Directory Structure

```
rfid-attendance-system/
├── app/                              # Next.js App Router
│   ├── layout.js                     # Root layout
│   ├── page.js                       # Public RFID scanning page
│   ├── globals.css                   # Global styles (Tailwind)
│   ├── admin/
│   │   ├── layout.js                 # Admin layout (auth redirect)
│   │   ├── page.js                   # Admin dashboard page
│   │   ├── login/                    # Login page
│   │   └── (root)/                   # Protected admin route group
│   │       ├── layout.js             # Sidebar + header layout
│   │       ├── employees-management/ # Employee CRUD page
│   │       ├── attendance-logs/      # Attendance logs page
│   │       ├── lists/                # Departments & Positions management
│   │       ├── account-logins/       # Admin account management
│   │       └── role-permissions/     # Role permission config
│   └── api/
│       ├── auth/                     # NextAuth [...nextauth] handler
│       ├── attendance/               # Public attendance endpoints
│       │   ├── add/                  # POST — log attendance
│       │   └── logs/                 # GET — fetch logs
│       ├── employees/                # Public employee lookup
│       └── admin/                    # Protected admin API routes
│           ├── accounts/             # Admin user CRUD
│           ├── attendance-logs/      # Attendance log management
│           ├── dashboard/            # Dashboard statistics
│           ├── departments/          # Department CRUD
│           ├── employees/            # Employee CRUD
│           ├── leaders/              # Leader lookup
│           ├── positions/            # Position CRUD
│           ├── profile/              # User profile
│           └── role-permissions/     # Permission CRUD
├── components/
│   ├── Clock.js                      # Real-time clock display
│   ├── admin/                        # Admin dashboard components
│   │   ├── dashboard/                # Dashboard stats, charts
│   │   ├── employees/                # Employee table, forms, dialogs
│   │   ├── attendance/               # Attendance table, filters
│   │   ├── accounts/                 # Account management components
│   │   ├── lists/                    # Department/Position lists
│   │   ├── role-permissions/         # Permission matrix UI
│   │   └── layout/                   # Sidebar, Header, PageWrapper
│   ├── auth/                         # Login form, auth guards
│   ├── profile/                      # User profile components
│   └── ui/                           # Base UI primitives (button, input, dialog, etc.)
├── hooks/                            # Custom React hooks
│   ├── useAttendance.js              # RFID scan + attendance logging
│   ├── useEmployeesManager.js        # Employee CRUD state
│   ├── useEmployeeForm.js            # Employee form state + validation
│   ├── useAttendanceLogsManager.js   # Attendance logs state + filtering
│   ├── useAccountLogins.js           # Admin account state
│   ├── useRolePermissions.js         # Permission data fetching
│   ├── useRolePermissionsManager.js  # Permission CRUD state
│   ├── useModuleAccess.js            # Client-side permission checks
│   ├── useAuth.js                    # Auth session hook
│   └── useAnimation.js               # Animation utilities
├── lib/
│   ├── db.js                         # MySQL connection pool + query helpers
│   ├── HIDListeners.js               # RFID HID keyboard event listeners
│   └── utils.js                      # cn() classname merge utility
├── constants/
│   ├── index.js                      # App constants
│   ├── moduleDefinitions.js          # Module definitions for permissions
│   └── accountConstants.js           # Account-related constants
├── utils/
│   └── dateUtils.js                  # Date formatting helpers
├── databases/                        # SQL schema + migrations
│   ├── schema.sql                    # Full database schema
│   ├── rfid_attendance.sql           # Database dump
│   ├── migration.sql                 # Migration scripts
│   ├── dev-setup.sql                 # Dev environment seed data
│   ├── role_permissions.sql          # Permission seed data
│   └── migrate_to_access_only.sql    # Permission model migration
├── scripts/                          # CLI setup scripts
│   ├── create-user.js                # Admin user creation
│   ├── hash.js                       # Password hashing
│   ├── setup-role-permissions.js     # Permission seeding
│   └── setup-simplified-permissions.sql
├── middleware.js                      # Route protection + permission enforcement
├── package.json
├── next.config.mjs
└── postcss.config.mjs
```

## Request Flow

### RFID Scan Flow (Public)
```
RFID Card Tap
  → HID Keyboard Events (lib/HIDListeners.js)
  → useAttendance hook captures tag
  → POST /api/attendance/add { rfidTag }
  → lib/db.js → findEmployeeByRfid()
  → getLastAttendanceLog() → determine time_in/time_out
  → createAttendanceLog()
  → Response with employee info + log type
  → UI: employee display + audio feedback
```

### Admin Page Flow
```
Browser → /admin/{page}
  → middleware.js
    → getToken() (NextAuth JWT)
    → hasRouteAccess(pathname, role)
      → getUserPermissions(role) [cached 5min or API call]
      → routeModuleMap lookup
    → Allow / Redirect to /admin
  → App Router → (root)/layout.js (Sidebar + Header)
  → Page Component
    → Custom Hook (e.g., useEmployeesManager)
    → fetch() → /api/admin/{resource}/route.js
    → lib/db.js → executeQuery()
    → JSON Response → State Update → Re-render
```

## Authentication Architecture

- **Provider**: NextAuth.js v4 with `CredentialsProvider`
- **Strategy**: JWT (no database sessions)
- **Token payload**: `{ id, name, username, employee_id, role }`
- **Session wrapper**: `app/admin/layout.js` wraps admin routes in `<SessionProvider>`
- **Middleware**: Intercepts all `/admin/*` routes (except `/admin/login` and `/api/*`)
- **Roles**: `superadmin` (full access), `admin`, `security`, `hr`

## Permission System

### Middleware Layer (Server-side)
1. `routeModuleMap` maps URL paths → module names
2. `getUserPermissions(role)` fetches from `/api/admin/role-permissions/by-role` with 5-min cache
3. Falls back to hardcoded `defaultPermissions` if API is unavailable
4. Superadmin bypasses all checks

### Client Layer
- `useModuleAccess` hook checks permissions for conditional UI rendering
- `useRolePermissions` fetches permission data for the permission management UI

## Data Layer

- **Connection**: Single `mysql2/promise` connection pool in `lib/db.js` (10 connections max)
- **Query pattern**: `executeQuery({ query, values })` — parameterized queries throughout
- **No ORM**: Raw SQL queries in API route handlers and `lib/db.js` helper functions
- **API routes**: Each resource has its own `route.js` under `app/api/admin/{resource}/`

## Component Patterns

- **Pages** are thin — they delegate to custom hooks for state and to component trees for UI
- **Custom hooks** encapsulate API calls, state management, and business logic
- **UI primitives** in `components/ui/` follow Radix UI + CVA (class-variance-authority) patterns
- **Admin components** are organized by feature domain under `components/admin/`
- **Forms** use React Hook Form + Zod schemas for validation
