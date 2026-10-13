# Recommended Action Roadmap: RFID Attendance System

This roadmap outlines prioritized improvements, bug fixes, and architectural refinements for the RFID Attendance System based on the comprehensive UI/UX and architectural audit.

---

## 📅 Roadmap Overview

```
Phase 1: Critical Security & Correctness (P0) ──► Immediate Fixes
Phase 2: Database Integrity & Route Hygiene (P1) ──► Data Reliability
Phase 3: UI/UX & Kiosk Usability (P2) ──► User Experience
Phase 4: Design System & Dependency Cleanup (P3) ──► Maintainability
Phase 5: Automated Testing & CI/CD (P4) ──► Quality Assurance
```

---

## Phase 1: Critical Security & Correctness (P0 — Immediate)

High-risk vulnerabilities and active bugs that can lead to data exposure, unauthorized modification, or incorrect table updates.

### 1.1 Protect Admin API Routes with Server-Side Session Guards
- [x] **Problem**: `/api/admin/*` endpoints for employees, departments, and positions have zero authentication or permission checks because [proxy.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/proxy.js#L158-L160) bypasses all `/api/` traffic.
- [x] **Affected Files**:
  - [app/api/admin/employees/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/employees/route.js)
  - [app/api/admin/employees/[id]/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/employees/%5Bid%5D/route.js)
  - [app/api/admin/departments/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/departments/route.js)
  - [app/api/admin/departments/[id]/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/departments/%5Bid%5D/route.js)
  - [app/api/admin/positions/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/positions/route.js)
  - [app/api/admin/positions/[id]/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/positions/%5Bid%5D/route.js)
- [x] **Action**:
  - Implement a centralized auth/role validation utility `requireAdminSession(allowedRoles)` in `lib/auth.js`.
  - Enforce `requireAdminSession()` at the top of each HTTP method (`GET`, `POST`, `PUT`, `DELETE`).
  - Verify that users without valid session cookies receive HTTP 401/403 responses.

### 1.2 Remove Erroneous `PUT` & `DELETE` Handlers in `positions/route.js`
- [x] **Problem**: [app/api/admin/positions/route.js:L5-L74](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/positions/route.js#L5-L74) contains copied handlers that execute `UPDATE departments` and `DELETE FROM departments`.
- [x] **Affected Files**:
  - [app/api/admin/positions/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/positions/route.js)
- [x] **Action**:
  - Delete lines 5 through 74 in `app/api/admin/positions/route.js`.
  - Ensure single-position `PUT` and `DELETE` requests continue to route to [app/api/admin/positions/[id]/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/positions/%5Bid%5D/route.js).

---

## Phase 2: Database Integrity & Route Hygiene (P1 — High Priority)

Eliminate race conditions in ID generation, fix internal fetch deadlocks in middleware, and resolve Next.js 16 deprecation warnings.

### 2.1 Replace Manual `MAX(id) + 1` with MySQL `AUTO_INCREMENT`
- [x] **Problem**: Manual `SELECT MAX(id)` logic causes race condition collisions (`ER_DUP_ENTRY`) under concurrent user creation.
- [x] **Affected Files**:
  - [app/api/admin/departments/route.js:L99-L106](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/departments/route.js#L99-L106)
  - [app/api/admin/positions/route.js:L174-L181](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/positions/route.js#L174-L181)
- [x] **Action**:
  - Omit explicit `id` in `INSERT INTO departments (name) VALUES (?)` and `INSERT INTO positions (name, is_leader) VALUES (?, ?)`.
  - Rely on MySQL's native `AUTO_INCREMENT` and read `result.insertId`.

### 2.2 Eliminate Middleware Self-Loopback HTTP Fetches
- [x] **Problem**: In [proxy.js:L49-L65](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/proxy.js#L49-L65), `proxy` executes an HTTP `fetch` to `http://localhost:3000/api/admin/role-permissions/by-role` on every navigation.
- [x] **Affected Files**:
  - [proxy.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/proxy.js)
  - [app/api/auth/[...nextauth]/route.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/auth/%5B...nextauth%5D/route.js)
- [x] **Action**:
  - Embed user permissions directly into the JWT token payload during authentication inside the NextAuth `jwt` callback.
  - Read permissions directly from `token.permissions` inside `proxy.js` without network overhead or port dependencies.

### 2.3 Await `params` in Next.js 16 Dynamic Route Handlers
- [x] **Problem**: Next.js 16 treats route `params` as a Promise. Synchronous destructuring triggers runtime deprecation warnings or failures.
- [x] **Affected Files**:
  - [app/api/admin/departments/[id]/route.js:L7](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/departments/%5Bid%5D/route.js#L7)
  - [app/api/admin/positions/[id]/route.js:L7](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/api/admin/positions/%5Bid%5D/route.js#L7)
- [x] **Action**:
  - Update route signatures to `const { id } = await context.params;`.

---

## Phase 3: UI/UX & Kiosk Usability (P2 — Medium Priority)

Improve navigation structure, resolve visual jumps, fix kiosk screen freezes, and eliminate client hydration flashes.

### 3.1 Unify Admin Layout & Make Dashboard Navigation Accessible
- [x] **Problem**: [app/admin/page.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/page.js) is outside `(root)`, lacking [SideNav](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/SideNav.jsx). Once inside subpages, there is no way to return to `/admin`.
- [x] **Affected Files**:
  - [app/admin/(root)/page.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/%28root%29/page.js)
  - [components/admin/layout/SideNav.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/SideNav.jsx)
  - [app/admin/login/page.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/login/page.js)
- [x] **Action**:
  - Move `app/admin/page.js` to `app/admin/(root)/page.js` so it automatically shares [SideNav](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/SideNav.jsx) and [Header](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/Header.jsx).
  - Add a "Dashboard" link (`/admin`) into `MODULE_DEFINITIONS` in [SideNav.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/SideNav.jsx#L23).
  - Wrap the SideNav logo in a `<Link href="/admin">`.
  - Change default login redirect in [LoginPage](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/login/page.js#L40-L46) to point to `/admin` instead of directly to `/admin/employees-management`.

### 3.2 Auto-Dismiss Kiosk Error Banner
- [x] **Problem**: When an unmapped RFID tag is tapped, [ErrorDisplay](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/layout/home/ErrorDisplay.js) remains permanently visible because `error` is never cleared automatically.
- [x] **Affected Files**:
  - [hooks/useAttendance.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/hooks/useAttendance.js)
  - [components/layout/home/ErrorDisplay.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/layout/home/ErrorDisplay.js)
- [x] **Action**:
  - Add an auto-dismiss timer in `useAttendance.js` that resets `error` after 4–5 seconds and re-enables `showInstructions`.

### 3.3 Guard Kiosk HID Keystroke Listener
- [x] **Problem**: [lib/HIDListeners.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/lib/HIDListeners.js) captures all window `keydown` events globally, intercepting input if an on-screen element has focus.
- [x] **Affected Files**:
  - [lib/HIDListeners.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/lib/HIDListeners.js)
- [x] **Action**:
  - Ignore keydown events originating from `INPUT`, `TEXTAREA`, or elements with `contenteditable`.

### 3.4 Prevent Flash of Unstyled Content (FOUC) on Admin Shell Mount
- [x] **Problem**: [app/admin/(root)/layout.js:L20](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/%28root%29/layout.js#L20) returns `null` when `!mounted`, resulting in a blank white screen during SSR and initial hydration.
- [x] **Affected Files**:
  - [app/admin/(root)/layout.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/%28root%29/layout.js)
- [x] **Action**:
  - Render static layout containers and use [SideNavSkeleton.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/SideNavSkeleton.jsx) instead of unmounting the entire tree.

### 3.5 Isolate Header Clock State to Avoid 1-Second Re-render Cascade
- [x] **Problem**: [components/admin/layout/Header.jsx:L20-L30](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/Header.jsx#L20-L30) re-renders the entire header tree every 1000ms.
- [x] **Affected Files**:
  - [components/admin/layout/Header.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/Header.jsx)
- [x] **Action**:
  - Extract the live time and date display into an isolated `<HeaderClock />` subcomponent.

---

## Phase 4: Design System & Dependency Cleanup (P3 — Maintainability)

Clean up mismatched packages, eliminate duplicate dialogs, and enforce uniform permission guards.

### 4.1 Apply `<PermissionGuard>` Consistently Across All Admin Subpages
- [x] **Problem**: [ListsPage](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/%28root%29/lists/page.js) and [AccountLoginsPage](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/%28root%29/account-logins/page.js) do not wrap their views with `<PermissionGuard>`, unlike `employees-management` and `attendance-logs`.
- [x] **Affected Files**:
  - [app/admin/(root)/lists/page.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/%28root%29/lists/page.js)
  - [app/admin/(root)/account-logins/page.js](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/app/admin/%28root%29/account-logins/page.js)
- [x] **Action**:
  - Wrap `ListsPage` with `<PermissionGuard module="data_management">`.
  - Wrap `AccountLoginsPage` with `<PermissionGuard module="account_logins">`.

### 4.2 Fix Erroneous `cn` Dependency and Import
- [x] **Problem**: [components/ui/button.jsx:L3](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/button.jsx#L3) imports `{ cn } from "cn"` instead of `@/lib/utils`, relying on an unnecessary third-party package `"cn": "^0.4.0"` in `package.json`.
- [x] **Affected Files**:
  - [components/ui/button.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/button.jsx)
  - [package.json](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/package.json)
- [x] **Action**:
  - Change import in `button.jsx` to `import { cn } from "@/lib/utils";`.
  - Run `npm uninstall cn`.

### 4.3 Standardize Date and Icon Libraries
- [x] **Problem**: Bundle size bloat and inconsistent code patterns caused by dual libraries:
  - Both `date-fns` and `dayjs` are installed.
  - Both `lucide-react` and `react-icons` are used side-by-side.
  - UI components mix `@radix-ui` (23 components) and `@base-ui/react` (1 component).
- [x] **Affected Files**:
  - [package.json](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/package.json)
  - Admin table and state components using `react-icons/fi`
- [x] **Action**:
  - Standardize all icon usage on `lucide-react` (shadcn default).
  - Standardize date manipulation on `dayjs` (or `date-fns`) across the entire repository.
  - Decide whether to complete the migration to `@base-ui` or revert `button.jsx` to `@radix-ui/react-slot`.

### 4.4 Deduplicate Delete Confirmation Dialogs & Clean Dead Code in `lib/db.js`
- [x] **Problem**:
  - Two parallel implementations of delete confirmation dialogs exist: [components/ui/DeleteConfirmationDialog.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/DeleteConfirmationDialog.jsx) and [components/admin/lists/DeleteConfirmationDialog.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/lists/DeleteConfirmationDialog.jsx).
  - [lib/db.js:L74-L82](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/lib/db.js#L74-L82) has dead functions (`getAttendanceLogs`) that reference outdated column names (`timestamp`, `e.department`).
- [x] **Action**:
  - Merge delete dialogs into `components/ui/DeleteConfirmationDialog.jsx` and remove the duplicate.
  - Clean up unreferenced queries in `lib/db.js`.

---

## Phase 5: Automated Testing & CI/CD (P4 — Quality Assurance)

Establish confidence in core business workflows.

### 5.1 Unit & Hook Tests
- [ ] **Target**: `useAttendance` state machine (scan -> processing -> success/error -> auto-clear).
- [ ] **Target**: `useRolePermissions` matrix logic (module access by role).
- [ ] **Tooling**: Vitest + `@testing-library/react`.

### 5.2 API Route Integration Tests
- [ ] **Target**: Authenticated vs unauthenticated access to `/api/admin/*`.
- [ ] **Target**: Attendance punch recording (`time_in` / `time_out` pair matching).
- [ ] **Target**: Concurrency checks on department/position creation.

### 5.3 End-to-End Tests
- [ ] **Target**: Public kiosk card tap workflow with simulated HID keyboard inputs.
- [ ] **Target**: Admin login, role-based navigation visibility, and logout confirmation.
- [ ] **Tooling**: Playwright.

---

## 🚀 Execution Checklist Summary

| Task | Priority | Complexity | Risk | Status |
| :--- | :---: | :---: | :---: | :---: |
| **1.1 Admin API Authentication Guards** | 🔴 P0 | Low | High | ✅ Completed |
| **1.2 Remove positions PUT/DELETE table mismatch** | 🔴 P0 | Low | High | ✅ Completed |
| **2.1 Native AUTO_INCREMENT on IDs** | 🟠 P1 | Low | Medium | ✅ Completed |
| **2.2 Remove Loopback Fetch in Middleware** | 🟠 P1 | Medium | Medium | ✅ Completed |
| **2.3 Await Next.js 16 dynamic route params** | 🟠 P1 | Low | Low | ✅ Completed |
| **3.1 Unify Admin Dashboard & Navigation** | 🟠 P2 | Medium | Low | ✅ Completed |
| **3.2 Kiosk Error Auto-Dismiss** | 🟠 P2 | Low | Low | ✅ Completed |
| **3.3 Kiosk HID Input Target Guard** | 🟡 P2 | Low | Low | ✅ Completed |
| **3.4 Resolve SSR Blank Shell Flash** | 🟡 P2 | Medium | Low | ✅ Completed |
| **4.1 Uniform `<PermissionGuard>` Usage** | 🟡 P3 | Low | Low | ✅ Completed |
| **4.2 Fix `cn` package & uninstall** | 🟡 P3 | Low | Low | ✅ Completed |
| **4.3 Standardize Icons & Date Packages** | 💡 P3 | Medium | Low | ✅ Completed |
| **4.4 Deduplicate Dialogs & Dead Queries** | 💡 P3 | Low | Low | ✅ Completed |
| **5.1 Setup Automated Test Suite** | 🟡 P4 | High | Low | ⏳ Pending |
