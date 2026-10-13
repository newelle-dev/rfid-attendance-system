# AGENTS.md — RFID Attendance System

> Runtime instructions for AI coding and data agents working on `rfid-attendance-system`.

## 1. Commands

| Command | Purpose | Environment / Rules |
|---|---|---|
| `npm run dev` | Start dev server with Turbopack | Local only (`http://localhost:3000`) |
| `npm run build` | Next.js production build verification | Run before opening PRs |
| `npm run lint` | ESLint 9 validation | Must pass with zero errors |
| `npm run seed:admins` | Seed default admin credentials | Requires active MySQL connection |

*Autonomous Rules*: Do NOT run unverified destructive database queries or commands that drop tables.

---

## 2. Boundaries

### Always Do
- Enforce `requireAdminSession(allowedRoles)` at the top of every handler in `app/api/admin/*`.
- Await `params` in Next.js 16 dynamic route handlers: `const { id } = await context.params;`.
- Use parameterized SQL queries (`?`) via `executeQuery({ query, values })` in `lib/db.js`.
- Import `cn` strictly from `@/lib/utils` (never use third-party `"cn"` package).
- Standardize icons on `lucide-react` and date formatting on `dayjs`.
- Validate all incoming API request payloads with `zod`.
- Use `<DeleteConfirmationDialog>` for all deletion actions in the UI.

### Ask First
- Modifying SQL schemas or migrations in `databases/`.
- Installing new npm dependencies or modifying `package.json`.
- Modifying authentication flow or JWT session callbacks in `proxy.js` or `app/api/auth/[...nextauth]/route.js`.

### Never Do
- Never interpolate variables directly into SQL queries (`WHERE id = ${id}`) — always parameterize.
- Never hardcode database credentials, tokens, or JWT secrets — use `.env`.
- Never bypass authentication on `/api/admin/*` routes.
- Never write unhashed passwords to `admin_users` (always hash with `bcryptjs`).
- Never bind global HID keydown listeners without ignoring active `INPUT`, `TEXTAREA`, or `contenteditable` targets.

---

## 3. Project Structure

```
├── app/
│   ├── page.js                     # Kiosk attendance terminal (RFID HID scan & punch feedback)
│   ├── admin/(root)/               # Authenticated admin portal shell (SideNav, Header, modules)
│   │   ├── employees-management/   # Employee records, RFID card assignment, photo upload
│   │   ├── attendance-logs/        # Attendance punch history & daily log viewer
│   │   ├── lists/                  # Department and position management
│   │   ├── account-logins/         # Admin user account management
│   │   └── role-permissions/      # Role-based access control matrix
│   ├── admin/login/page.js         # Admin credentials login page
│   └── api/
│       ├── admin/                  # Protected admin REST endpoints (employees, departments, etc.)
│       └── attendance/             # Public kiosk punch recording endpoint
├── components/admin/layout/        # SideNav, Header, HeaderClock, navigation guards
├── components/ui/                  # Base UI / Radix primitives & reusable UI components
├── lib/
│   ├── auth.js                     # requireAdminSession helper for route handlers
│   ├── db.js                       # mysql2 connection pool and executeQuery runner
│   ├── HIDListeners.js             # Kiosk RFID hardware card swipe listener
│   └── utils.js                    # cn class merge utility
├── databases/                      # SQL schema definitions and migration scripts
└── proxy.js                        # Next.js 16 proxy & session routing middleware
```

---

## 4. Code Style & Patterns

### Next.js 16 Protected API Route Handler
```javascript
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1) });

export async function PUT(request, context) {
  const { error } = await requireAdminSession(["admin", "superadmin"]);
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  await executeQuery({
    query: "UPDATE departments SET name = ? WHERE id = ?",
    values: [parsed.data.name, id],
  });
  return NextResponse.json({ success: true });
}
```

---

## 5. Certified Database Contracts

| Table | Certified Columns | Constraints & Invariants |
|---|---|---|
| `admin_users` | `id`, `name`, `username`, `employee_id`, `password`, `role` | `role`: `'superadmin' \| 'admin' \| 'security' \| 'hr'`; passwords bcrypt-hashed. |
| `employees` | `id`, `ashima_id`, `name`, `rfid_tag`, `status`, `department_id`, `position_id`, `leader` | `ashima_id` and `rfid_tag` are UNIQUE; FK to `departments`, `positions`. |
| `attendance_logs` | `id`, `employee_id`, `ashima_id`, `log_type`, `timestamp`, `rfid_tag` | `log_type`: `'time_in' \| 'time_out' \| 'break_in' \| 'break_out'`. |
| `departments` | `id`, `name` | `name` is UNIQUE; native `AUTO_INCREMENT` ID. |
| `positions` | `id`, `name`, `is_leader` | `name` is UNIQUE; `is_leader` is boolean flag. |
| `role_permissions` | `id`, `role`, `module`, `permission` | `permission` stored as JSON object `{ access: boolean }`. |

---

## 6. Git Workflow

- **Commit Format**: Conventional Commits standard (`<type>(<scope>): <subject>`)
  - Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
  - Scopes: `kiosk`, `admin`, `api`, `db`, `auth`, `ui`
  - Example: `fix(api): await dynamic route params in positions handler`
- **Branch Naming**: `feat/<feature-name>`, `fix/<bug-name>`, `refactor/<target>`
