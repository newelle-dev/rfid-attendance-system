# RFID Attendance System

A modern, high-performance attendance tracking and management system built with **Next.js 16** (App Router) and **React 19** using RFID hardware scanning for fast employee punch tracking. The system features a kiosk terminal for card scanning, paired with a full-featured admin portal engineered with React Server Components, role-based access control, and a 4-tier layout design standard.

---

## 🚀 Key Features

### 🏢 Kiosk Attendance Terminal (`/`)
- **Instant RFID Card Swiping**: Rapid check-in/check-out detection via USB RFID reader (HID keyboard emulation).
- **Keystroke Target Guarding**: Hardware listener (`lib/HIDListeners.js`) ignores focused inputs (`INPUT`, `TEXTAREA`, `SELECT`, `contenteditable`) to prevent scan interference during form entry.
- **Flatscreen TV Display Calibration**: Calibrated for wall-mounted 1080p/4K TVs in corporate lobbies with fixed viewport fitting (`h-screen overflow-hidden`) and no vertical scrollbars.
- **High-Tech Corporate HUD Clock**: Precision monospace digital time with optical corner reticles, dual-tone digits, pulsating colon, Philippine Standard Time (`PST • UTC+8`) telemetry metadata, and an animated 60-second calibrated meter.
- **Full-Screen Punch Confirmation Dossier**: Instant pop-up card displaying employee photo, Ashima ID, name, department, position, and paired Time In/Out punch records with a 9-second auto-clearing progress bar.
- **Dedicated Error Feedback Overlay**: Distinct audio cues and high-contrast error cards for unregistered or unrecognized badge swipes.
- **Interactive Badge Simulator Drawer**: Accessible via the top header button or `D` keyboard shortcut to test valid and invalid RFID card swipes without hardware.
- **Corporate Identity Footer**: Edge-to-edge branding featuring the EastWest BPO logo, `Security Attendance Terminal` badge, and live `Scanner Ready` indicator.

### 🛡️ Admin Portal (`/admin`)
- **4-Tier Layout Standard**: Uniform architecture across all modules (`PageHeader` -> Command Header -> KPI Strip -> Main Workspace Card).
- **Dashboard Overview (`/admin`)**: Real-time KPI statistics (total employees, today's attendance counts, department metrics) and live activity punch feed.
- **Employees Management (`/admin/employees-management`)**: Built with React Server Components (`lib/server/employees.js`) for concurrent server-side data fetching without client waterfalls. Includes base64 photo uploads, RFID tag binding, faceted search/filtering, and slide-over `<Sheet>` dossiers.
- **Attendance Logs (`/admin/attendance-logs`)**: Searchable historical punch logs with department and date range filters, punch status badges, and client-side CSV export.
- **Data Management (`/admin/lists`)**: Department and position administration with native `AUTO_INCREMENT` IDs and supervisor/leadership flags.
- **Account Logins (`/admin/account-logins`)**: Operator account administration with bcrypt-hashed credentials and role assignments.
- **Role Permissions Matrix (`/admin/role-permissions`)**: Granular toggle matrix controlling access to administrative modules per role.
- **Global Command Menu (`Cmd+K` / `Ctrl+K`)**: Rapid keyboard search and module navigation palette.

### 🔐 Security & Access Control
- **NextAuth.js JWT Authentication**: Stateless session management with 8-hour token lifespans.
- **Embedded JWT Permissions**: Role permissions are fetched during sign-in and cached in the JWT (`token.permissions`), eliminating redundant loopback HTTP queries.
- **Proxy Route Enforcement (`proxy.js`)**: Next.js 16 middleware proxy intercepts all admin navigations, ensuring unauthenticated or unauthorized users are redirected.
- **API Handler Guards**: Every endpoint in `app/api/admin/*` enforces `requireAdminSession(allowedRoles)` from `lib/auth.js`.
- **Zod Request Validation**: All incoming API requests are validated with centralized Zod schemas in `lib/validations/`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) with `@tailwindcss/postcss` & `tw-animate-css` |
| **Component Primitives** | [Radix UI](https://www.radix-ui.com/) & [Base UI](https://base-ui.com/) |
| **Table Engine** | [TanStack React Table 8](https://tanstack.com/table) |
| **Form Management** | [React Hook Form 7](https://react-hook-form.com/) + [Zod 3.25](https://zod.dev/) |
| **Icons & Typography** | [Lucide React](https://lucide.dev/) |
| **Date & Time** | [Day.js](https://day.js.org/) |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) |
| **Authentication** | [NextAuth.js 4](https://next-auth.js.org/) with `bcryptjs` |
| **Database** | [MySQL](https://www.mysql.com/) via `mysql2/promise` connection pool |
| **Audio Feedback** | [use-sound](https://github.com/joshwcomeau/use-sound) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **MySQL Server**: v8.0+ or MariaDB 10.4+
- **RFID Card Reader**: USB reader configured for HID keyboard emulation mode

---

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/newelle-dev/rfid-attendance-system.git
   cd rfid-attendance-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the project root:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=rfid_attendance

   # NextAuth Authentication
   NEXTAUTH_SECRET=your_super_secret_jwt_key
   NEXTAUTH_URL=http://localhost:3000

   # Application Environment
   NODE_ENV=development
   ```

4. **Initialize Database**
   Import the unified schema and initial seed data into MySQL:
   ```bash
   # Create database and import schema
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rfid_attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
   mysql -u root -p rfid_attendance < databases/schema.sql
   ```

5. **Seed Default Admin Credentials**
   Seed default operator accounts for all 4 roles:
   ```bash
   npm run seed:admins
   ```

   **Default Accounts Seeded:**
   | Role | Username | Employee ID | Default Password |
   |---|---|---|---|
   | **superadmin** | `superadmin` | `00-00000` | `superadmin123` |
   | **admin** | `admin` | `01-00000` | `admin123` |
   | **security** | `security` | `02-00000` | `security123` |
   | **hr** | `hr` | `03-00000` | `hr123` |

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Access Applications**
   - **Kiosk Terminal**: [http://localhost:3000](http://localhost:3000)
   - **Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin) (or `/admin/login`)

---

### 🐳 Running with Docker

The project includes ready-to-run multi-stage Docker configurations for both local development and production. Both setups automatically initialize the MySQL database schema and seed the default administrative accounts.

#### Option A: Local Development (Hot Reloading)

Runs the Next.js development server with file watching and live reload:

```bash
# Start containers in development mode
docker compose -f docker-compose.dev.yml up --build

# Run in background (detached)
docker compose -f docker-compose.dev.yml up -d

# Stop containers
docker compose -f docker-compose.dev.yml down
```

#### Option B: Production Deployment (Standalone Minimal Image)

Builds an optimized, lightweight Next.js standalone container (~180MB) and MySQL service:

```bash
# Build and run production containers
docker compose up --build -d

# View container logs
docker compose logs -f web

# Stop containers
docker compose down
```

*Note*: The MySQL service exposes port `3306` to your host machine (`localhost:3306`), so you can connect directly with desktop tools like DBeaver, TablePlus, or MySQL Workbench using user `root` and password `rootpassword`.

---

## 💻 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Next.js development server with Turbopack at `http://localhost:3000` |
| `npm run build` | Validates types and builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint 9 to ensure zero lint errors |
| `npm run seed:admins` | Seeds/reseeds default admin accounts into `admin_users` table |

---

## 🏗️ Project Architecture

```
rfid-attendance-system/
├── app/
│   ├── page.js                     # Kiosk attendance terminal
│   ├── admin/
│   │   ├── layout.js               # Root admin server layout with metadata
│   │   ├── AdminProviders.jsx      # Session & Theme client providers wrapper
│   │   ├── login/page.js           # Admin login page
│   │   └── (root)/                 # Authenticated admin shell (4-tier layout)
│   │       ├── layout.js           # SidebarProvider, SideNav, Header, Toaster
│   │       ├── page.js             # Dashboard overview & real-time punch feed
│   │       ├── employees-management/ # Employee CRUD (Server Component + Client Island)
│   │       ├── attendance-logs/    # Attendance punch logs & date filters
│   │       ├── lists/              # Departments & positions management
│   │       ├── account-logins/     # Admin user accounts & passwords
│   │       └── role-permissions/   # Role-based access control matrix
│   └── api/
│       ├── attendance/             # Public kiosk punch endpoints
│       └── admin/                  # Protected REST endpoints (requireAdminSession)
├── components/
│   ├── kiosk/                      # Kiosk terminal modules (clock, header, footer, punch overlay, error overlay, drawer)
│   ├── admin/                      # Domain modules (employees, attendance, dashboard, etc.)
│   ├── auth/                       # LoginForm, PasswordInput, PermissionGuard
│   └── ui/                         # Base UI / Radix primitives, DeleteConfirmationDialog, Sheet
├── hooks/                          # Custom React hooks (useEmployeesManager, useAttendance, etc.)
├── lib/
│   ├── auth.js                     # requireAdminSession helper for API routes
│   ├── db.js                       # mysql2 connection pool & executeQuery helper
│   ├── HIDListeners.js             # Kiosk RFID hardware keyboard listener
│   ├── utils.js                    # cn() class merge helper
│   ├── server/                     # React Server Component data loaders (employees.js)
│   └── validations/                # Centralized Zod request schemas
├── databases/                      # Unified SQL schema definition (schema.sql)
├── scripts/                        # Utility scripts (seed-admin-users.js)
└── proxy.js                        # Next.js 16 session proxy & route authorization
```

---

## 📄 License

This project is licensed under the MIT License.
