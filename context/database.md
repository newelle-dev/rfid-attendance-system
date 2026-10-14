# Database Documentation

## Overview

- **Engine**: MySQL (InnoDB)
- **Database name**: `rfid_attendance`
- **Character set**: `utf8mb4` / `utf8mb4_general_ci`
- **Connection**: `mysql2/promise` pool configured in `lib/db.js` (max 10 connections)
- **Query Pattern**: Strictly parameterized queries using `executeQuery({ query, values })`
- **Primary Keys**: Native MySQL `AUTO_INCREMENT` IDs (never manual `MAX(id) + 1`)

---

## Entity Relationship Diagram

```mermaid
erDiagram
    departments ||--o{ employees : "has"
    positions ||--o{ employees : "has"
    employees ||--o{ employees : "supervises"
    employees ||--o{ attendance_logs : "punches via ashima_id"
    admin_users ||--o{ audit_logs : "triggers"

    departments {
        int id PK "AUTO_INCREMENT"
        varchar name UK "Department name"
        text description
        enum status "active, inactive"
    }

    positions {
        int id PK "AUTO_INCREMENT"
        varchar name UK "Position title"
        tinyint is_leader "1 = leadership flag"
        text description
        enum status "active, inactive"
    }

    employees {
        int id PK "AUTO_INCREMENT"
        varchar ashima_id UK "Unique identifier (XX-XXXXX)"
        varchar name "Full employee name"
        varchar rfid_tag UK "Card/tag UID"
        longblob photo "Binary image data"
        varchar emp_stat "Regular, Probationary, etc."
        enum status "active, inactive, resigned"
        int department_id FK "References departments.id"
        int position_id FK "References positions.id"
        int leader FK "Self-referencing supervisor ID"
        datetime last_active "Most recent punch/activity"
        date hire_date
    }

    attendance_logs {
        int id PK "AUTO_INCREMENT"
        varchar ashima_id "References employees.ashima_id"
        varchar log_type "Punch type: 'IN' or 'OUT'"
        datetime in_time "Time of arrival / check-in"
        datetime out_time "Time of departure / check-out (NULL if clocked in)"
    }

    admin_users {
        int id PK "AUTO_INCREMENT"
        varchar name "Display name"
        varchar username UK "Login username"
        varchar employee_id UK "Ashima ID (00-00000)"
        varchar password "bcrypt-hashed password"
        enum role "superadmin, admin, security, hr"
        datetime last_login "Last authentication timestamp"
    }

    role_permissions {
        int id PK "AUTO_INCREMENT"
        enum role "superadmin, admin, security, hr"
        varchar module "Module key (e.g. employees_management)"
        json permission "Permissions object: {\"access\": true}"
    }

    audit_logs {
        int id PK "AUTO_INCREMENT"
        int user_id FK "References admin_users.id"
        varchar action "Action type"
        varchar table_name
        int record_id
        json old_values
        json new_values
        varchar ip_address
        text user_agent
    }

    system_settings {
        int id PK "AUTO_INCREMENT"
        varchar setting_key UK
        text setting_value
        enum setting_type "string, number, boolean, json"
        text description
        tinyint is_public
    }
```

---

## Active Tables & Schema Contracts

### `admin_users`
Stores administrative operators who can access `/admin`.

| Column        | Type                                         | Constraints                | Notes                                 |
| ------------- | -------------------------------------------- | -------------------------- | ------------------------------------- |
| `id`          | `INT(11)` AUTO_INCREMENT                     | PRIMARY KEY                | Native auto-increment ID              |
| `name`        | `VARCHAR(255)`                               | NOT NULL                   | Operator display name                 |
| `username`    | `VARCHAR(100)`                               | NOT NULL, UNIQUE           | Login username                        |
| `employee_id` | `VARCHAR(50)`                                | NOT NULL, UNIQUE           | Ashima employee ID                    |
| `password`    | `VARCHAR(255)`                               | NOT NULL                   | bcrypt-hashed password (cost factor 10) |
| `role`        | `ENUM('superadmin','admin','security','hr')` | NOT NULL, DEFAULT `'admin'`| Access tier                           |
| `created_at`  | `TIMESTAMP`                                  | DEFAULT CURRENT_TIMESTAMP  |                                       |
| `updated_at`  | `TIMESTAMP`                                  | ON UPDATE CURRENT_TIMESTAMP|                                       |
| `last_login`  | `DATETIME`                                   | NULLABLE                   | Updated on every successful login     |

> [!NOTE]
> Default admin accounts are seeded via `npm run seed:admins` (`scripts/seed-admin-users.js`).

---

### `departments`
Organizational units for grouping employees.

| Column        | Type                        | Constraints               | Notes                        |
| ------------- | --------------------------- | ------------------------- | ---------------------------- |
| `id`          | `INT(11)` AUTO_INCREMENT    | PRIMARY KEY               | Native auto-increment ID     |
| `name`        | `VARCHAR(255)`               | NOT NULL, UNIQUE          | Department title             |
| `description` | `TEXT`                       | NULLABLE                  | Optional description         |
| `status`      | `ENUM('active','inactive')` | DEFAULT `'active'`        | Department status            |
| `created_at`  | `TIMESTAMP`                  | DEFAULT CURRENT_TIMESTAMP |                              |
| `updated_at`  | `TIMESTAMP`                  | ON UPDATE CURRENT_TIMESTAMP|                             |

---

### `positions`
Job titles and hierarchy classifications.

| Column        | Type                        | Constraints               | Notes                                      |
| ------------- | --------------------------- | ------------------------- | ------------------------------------------ |
| `id`          | `INT(11)` AUTO_INCREMENT    | PRIMARY KEY               | Native auto-increment ID                   |
| `name`        | `VARCHAR(255)`               | NOT NULL, UNIQUE          | Position title                             |
| `is_leader`   | `TINYINT(1)`                 | DEFAULT `0`               | `1` if role can be designated as supervisor |
| `description` | `TEXT`                       | NULLABLE                  | Optional description                       |
| `status`      | `ENUM('active','inactive')` | DEFAULT `'active'`        | Position status                            |
| `created_at`  | `TIMESTAMP`                  | DEFAULT CURRENT_TIMESTAMP |                                            |
| `updated_at`  | `TIMESTAMP`                  | ON UPDATE CURRENT_TIMESTAMP|                                           |

---

### `employees`
Employee master records.

| Column          | Type                                    | Constraints             | Notes                                      |
| --------------- | --------------------------------------- | ----------------------- | ------------------------------------------ |
| `id`            | `INT(11)` AUTO_INCREMENT                | PRIMARY KEY             | Native auto-increment ID                   |
| `ashima_id`     | `VARCHAR(12)`                            | NOT NULL, UNIQUE        | Format: `XX-XXXXX`                         |
| `name`          | `VARCHAR(150)`                           | NOT NULL                | Employee full name                         |
| `rfid_tag`      | `VARCHAR(50)`                            | NULLABLE, UNIQUE        | Hardware RFID card UID                     |
| `photo`         | `LONGBLOB`                               | NULLABLE                | Binary photo data (encoded to base64 in UI)|
| `emp_stat`      | `VARCHAR(12)`                            | DEFAULT `'Regular'`     | Employment type (Regular, Probationary)    |
| `status`        | `ENUM('active','inactive','resigned')`  | DEFAULT `'active'`      | Current employment status                  |
| `department_id` | `INT(11)`                                | FK → `departments.id`  | ON DELETE SET NULL                         |
| `position_id`   | `INT(11)`                                | FK → `positions.id`    | ON DELETE SET NULL                         |
| `leader`        | `INT(11)`                                | FK → `employees.id`    | Supervisor employee ID                     |
| `last_active`   | `DATETIME`                               | NULLABLE                | Timestamp of most recent card tap          |
| `hire_date`     | `DATE`                                   | NULLABLE                | Date hired                                 |
| `created_at`    | `TIMESTAMP`                              | DEFAULT CURRENT_TIMESTAMP |                                          |
| `updated_at`    | `TIMESTAMP`                              | ON UPDATE CURRENT_TIMESTAMP|                                         |

---

### `attendance_logs`
Attendance punch logs generated during RFID kiosk check-ins and check-outs.

> [!IMPORTANT]
> **Active Implementation Contract**: The live production schema and query layer (`app/api/attendance/add/route.js`, `app/api/admin/attendance-logs/route.js`, `databases/schema.sql`) stores paired punches via `in_time` and `out_time`, joining employee metadata through `employees.ashima_id`.

| Column      | Type          | Constraints | Notes                                                     |
| ----------- | ------------- | ----------- | --------------------------------------------------------- |
| `id`        | `INT(11)` AI  | PRIMARY KEY | Auto-increment punch ID                                   |
| `ashima_id` | `VARCHAR(20)` | NOT NULL    | Joined with `employees.ashima_id`                         |
| `log_type`  | `VARCHAR(10)` | NOT NULL    | `'IN'` (checked in, out_time is NULL) or `'OUT'` (paired) |
| `in_time`   | `DATETIME`    | NOT NULL    | Timestamp of punch in                                     |
| `out_time`  | `DATETIME`    | NULLABLE    | Timestamp of punch out; NULL while clocked in             |

#### Punch State Machine
1. When an employee taps their card:
   - System queries latest record: `SELECT id, log_type, in_time, out_time FROM attendance_logs WHERE ashima_id = ? ORDER BY in_time DESC LIMIT 1`.
2. **If no record exists, or previous record is `'OUT'`, or previous `'IN'` has non-null `out_time`**:
   - Creates a new punch: `INSERT INTO attendance_logs (ashima_id, log_type, in_time, out_time) VALUES (?, 'IN', NOW(), NULL)`.
3. **If previous record has `log_type = 'IN'` and `out_time IS NULL`**:
   - Completes the punch pair: `UPDATE attendance_logs SET log_type = 'OUT', out_time = NOW() WHERE id = ?`.

---

### `role_permissions`
Module-level permissions controlling admin portal view and action access.

| Column       | Type                                         | Constraints               | Notes                                      |
| ------------ | -------------------------------------------- | ------------------------- | ------------------------------------------ |
| `id`         | `INT(11)` AUTO_INCREMENT                     | PRIMARY KEY               |                                            |
| `role`       | `ENUM('superadmin','admin','security','hr')` | NOT NULL                  | Target role                                |
| `module`     | `VARCHAR(100)`                               | NOT NULL                  | Module identifier                          |
| `permission` | `JSON`                                       | NOT NULL                  | Stored as `{"access": true}`               |
| `created_at` | `TIMESTAMP`                                  | DEFAULT CURRENT_TIMESTAMP |                                            |
| `updated_at` | `TIMESTAMP`                                  | ON UPDATE CURRENT_TIMESTAMP|                                           |

**Unique Constraint**: `(role, module)`  
**Standard Modules**:
- `employees_management`
- `attendance_logs`
- `data_management` (Departments & Positions)
- `account_logins`
- `role_permissions`

---

## Database Connection & API Helpers

In `lib/db.js`:
```javascript
// Parameterized query runner
export async function executeQuery({ query, values = [] }) { ... }

// User credential lookup by username or employee ID
export async function getUserByIdentifier(identifier) { ... }
```

Server-side queries for React Server Components are maintained in `lib/server/`:
- `lib/server/employees.js`:
  - `getEmployeesData({ page, limit, search, department, position, leader, status })`
  - `getEmployeeStats()`
  - `getEmployeeFilterMetadata()`

---

## SQL Scripts & Migrations
 
| File | Purpose |
| --- | --- |
| `databases/schema.sql` | Unified DDL script with certified tables, foreign keys, indexes, and baseline seed data |
| `scripts/seed-admin-users.js` | Node script to seed/reseed default admin accounts (`npm run seed:admins`) |
