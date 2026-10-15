# Project Overview

## Summary

The **RFID Attendance System** is a high-performance full-stack web application built with **Next.js 16** (App Router) and **React 19** for tracking and managing employee attendance via hardware RFID card scanning. Employees tap their RFID cards on a USB reader (operating in HID keyboard emulation mode), and the system automatically logs check-in/check-out events with instant audio-visual feedback. 

Administrators manage employee records, RFID credentials, departmental lists, attendance logs, user accounts, and role-based permissions through an authenticated admin portal that follows a standard 4-tier layout with Server Components and slide-over sheets.

## Tech Stack

| Layer          | Technology                                                             |
| -------------- | ---------------------------------------------------------------------- |
| Framework      | **Next.js 16.4.0** (App Router, Turbopack dev server)                  |
| UI Library     | **React 19.3.0** (Server Components + Client Islands)                  |
| Styling        | **Tailwind CSS 4.3.3** with `@tailwindcss/postcss` & `tw-animate-css`  |
| UI Components  | **Radix UI** & **Base UI** (`@base-ui/react`) primitives               |
| Tables         | **TanStack React Table 8**                                             |
| Animations     | **Framer Motion 12**                                                   |
| Forms & Validation | **React Hook Form 7** + **Zod 3.25** schemas in `lib/validations/` |
| Icons          | **Lucide React** (standardized across the application)                 |
| Auth           | **NextAuth.js 4** (credentials provider, JWT strategy with permissions)|
| Route Security | **`proxy.js`** (Next.js 16 proxy middleware with JWT permission check) |
| Database       | **MySQL** via `mysql2/promise` connection pool                         |
| Password Hash  | **bcryptjs**                                                           |
| Date Handling  | **dayjs** (standardized across the application)                        |
| Audio Feedback | **use-sound**                                                          |
| Notifications  | **Sonner** (`sonner`)                                                  |

## Key Features

### Employee-Facing (Kiosk Attendance Terminal)
- **Fast RFID Card Tap**: Automatic `IN` / `OUT` paired logging via hardware HID listener (`lib/HIDListeners.js`).
- **Input Guarding**: HID listener ignores focused form inputs (`INPUT`, `TEXTAREA`, `SELECT`, `contenteditable`) to prevent unintended keystroke capture.
- **Flatscreen TV Calibration**: Engineered for wall-mounted 1080p/4K TVs in corporate lobbies with fixed viewport fitting (`h-screen overflow-hidden`) and no vertical scrollbars.
- **High-Tech Corporate HUD Clock**: Precision monospace digital time with optical corner reticles, dual-tone digits, glowing colon, Philippine Standard Time (`PST • UTC+8`) telemetry metadata, and an animated 60-second calibrated meter.
- **Full-Screen Punch Confirmation Dossier**: Instant pop-up card displaying employee photo, Ashima ID, name, department, position, and paired Time In/Out punch records with a 9-second auto-clearing progress bar.
- **Dedicated Error Feedback Overlay**: Distinct audio cues and high-contrast error cards for unregistered or unrecognized badge swipes.
- **Interactive Badge Simulator Drawer**: Accessible via the top header button or `D` keyboard shortcut to test valid and invalid RFID card swipes without hardware.
- **Corporate Identity Footer**: Edge-to-edge branding featuring the EastWest BPO logo, `Security Attendance Terminal` badge, and live `Scanner Ready` indicator.

### Admin Portal
- **Dashboard Overview (`/admin`)**: Aggregated system metrics (total employees, today's attendance punches, department counts) and real-time activity feed.
- **Employee Management (`/admin/employees-management`)**: React Server Component architecture with concurrent data fetching (`lib/server/employees.js`). CRUD records, base64 photo upload, RFID card assignment, department/position links, and slide-over `<Sheet>` dossiers.
- **Attendance Logs (`/admin/attendance-logs`)**: Punch history viewer with date-range filters, status pills, and client-side CSV export.
- **Data Management (`/admin/lists`)**: Department and position management with native `AUTO_INCREMENT` IDs and leadership flags.
- **Account Logins (`/admin/account-logins`)**: Admin user management with bcrypt hashing and role assignment.
- **Role Permissions (`/admin/role-permissions`)**: Granular module access matrix configured per role (`superadmin`, `admin`, `security`, `hr`).
- **Global Command Menu (`<CommandMenu />`)**: Quick navigation palette accessible via `Cmd+K` / `Ctrl+K`.

### Security & Architecture
- **JWT Permissions**: User role permissions are embedded directly into the NextAuth JWT token on login, eliminating runtime loopback HTTP requests.
- **Protected Routes**: Next.js 16 `proxy.js` guards `/admin/*` routes based on JWT permissions with fallback default permissions.
- **API Guarding**: All `/api/admin/*` endpoints strictly enforce `requireAdminSession(allowedRoles)` from `lib/auth.js`.
- **Validation**: Incoming API requests are validated with centralized Zod schemas in `lib/validations/`.
- **Design System Standards**: All admin pages strictly adhere to the 4-tier layout (`PageHeader` -> Command Header -> KPI Strip -> Main Workspace Card) with `<div className="space-y-6">` root wrapper and semantic color tokens.

## Environment Variables

| Variable           | Purpose                                 |
| ------------------ | --------------------------------------- |
| `DB_HOST`          | MySQL host                              |
| `DB_USER`          | MySQL username                          |
| `DB_PASSWORD`      | MySQL password                          |
| `DB_NAME`          | MySQL database name (`rfid_attendance`) |
| `NEXTAUTH_SECRET`  | Secret key for NextAuth.js JWT signing  |
| `NEXTAUTH_URL`     | Application base URL (`http://localhost:3000`) |

## Development & Scripts

```bash
# Install dependencies
npm install

# Seed admin user accounts (all 4 roles: superadmin, admin, security, hr)
npm run seed:admins

# Start dev server with Turbopack
npm run dev

# Code linting (ESLint 9)
npm run lint

# Production build verification
npm run build
```

## Conventions

- **App Router**: Next.js 16 App Router using `app/` and route group `(root)` for shared admin portal layouts.
- **Server Components & Islands**: Preload read-heavy page data server-side in `page.js` via `lib/server/` and delegate interactivity to Client Islands.
- **Server Session Guard**: Always call `const { error } = await requireAdminSession(allowedRoles)` at the top of admin API handlers.
- **Dynamic Route Params**: Always await route params in Next.js 16 dynamic handlers: `const { id } = await context.params`.
- **Centralized Layout**: Outer margins, max-widths, and padding are managed by `app/admin/(root)/layout.js`. Admin pages must never specify outer container widths.
- **UI Dialogs & Drawers**: Slide-over `<Sheet>` for inspection/creation workflows; `<DeleteConfirmationDialog>` for destructive actions.
