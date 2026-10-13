# Project Overview

## Summary

The **RFID Attendance System** is a full-stack web application for managing employee attendance using RFID card scanning. Employees tap their RFID cards on a reader (HID keyboard emulation mode), and the system automatically logs check-in/check-out events. Administrators manage employees, departments, positions, attendance records, and role-based access through a comprehensive admin dashboard.

## Tech Stack

| Layer          | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| Framework      | **Next.js 15.3.1** (App Router, Turbopack dev server)          |
| UI Library     | **React 19**                                                   |
| Styling        | **Tailwind CSS 4** with `tw-animate-css`                       |
| UI Components  | **Radix UI** (dialog, select, tabs, switch, tooltip, etc.)     |
| Tables         | **TanStack React Table 8**                                     |
| Animations     | **Framer Motion 12**                                           |
| Forms          | **React Hook Form 7** + **Zod** validation + `@hookform/resolvers` |
| Icons          | **Lucide React**, **React Icons**                              |
| Auth           | **NextAuth.js 4** (credentials provider, JWT strategy)         |
| Database       | **MySQL** via `mysql2/promise` connection pool                 |
| Password Hash  | **bcryptjs**                                                   |
| Date Handling  | **date-fns** and **dayjs**                                     |
| Data Export    | **json2csv**                                                   |
| Audio Feedback | **use-sound**                                                  |
| Notifications  | **notistack**                                                  |

## Key Features

### Employee-Facing (Public Page)
- RFID card tap → automatic `time_in` / `time_out` logging
- Real-time clock display with animations
- Employee info + photo display upon scan
- Audio feedback on success/failure

### Admin Dashboard
- **Dashboard** — aggregated statistics (total employees, today's attendance, department metrics)
- **Employee Management** — CRUD employees with photo upload, RFID tag assignment, department/position linking
- **Attendance Logs** — filter, search, export to CSV
- **Data Management (Lists)** — manage departments and positions
- **Account Logins** — create/manage admin user accounts
- **Role Permissions** — configure module-level access per role

### Security
- NextAuth.js session/JWT authentication
- Role-based access: `superadmin`, `admin`, `security`, `hr`
- Middleware-enforced route protection with permission checks (database-backed with fallback defaults)
- Permissions cache with 5-minute TTL in middleware

## Environment Variables

| Variable           | Purpose                                |
| ------------------ | -------------------------------------- |
| `DB_HOST`          | MySQL host                             |
| `DB_USER`          | MySQL username                         |
| `DB_PASSWORD`      | MySQL password                         |
| `DB_NAME`          | MySQL database name (`rfid_attendance`)|
| `NEXTAUTH_SECRET`  | Secret key for NextAuth.js JWT signing |
| `NEXTAUTH_URL`     | Application base URL                   |

## Development

```bash
# Install dependencies
npm install

# Start dev server (Turbopack)
npm run dev

# Production build
npm run build && npm start
```

### Setup Scripts
- `scripts/create-user.js` — create initial admin user
- `scripts/hash.js` — bcrypt password hashing utility
- `scripts/setup-role-permissions.js` — seed default role permissions

## Conventions

- **App Router** — all routes under `app/` using the Next.js 13+ App Router pattern
- **Route groups** — admin pages use `(root)` route group for shared layout
- **Custom hooks** — all business logic hooks live in `hooks/` (e.g., `useEmployeesManager`, `useAttendanceLogsManager`)
- **Component organization** — `components/admin/` for dashboard components, `components/ui/` for base primitives
- **Constants** — centralized in `constants/` (nav items, module definitions, auth config)
- **Database layer** — `lib/db.js` provides `executeQuery()` and convenience functions; all API routes call this directly
