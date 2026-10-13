# tabs

2026-10-14, strategy: golden pair via CLI (shadcn add tabs --overwrite), migrated successfully.

## Changed

- [tabs.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/tabs.jsx): migrated from `@radix-ui/react-tabs` to `@base-ui/react/tabs`. Mapped `TabsPrimitive.Trigger` to `TabsPrimitive.Tab` and `TabsPrimitive.Content` to `TabsPrimitive.Panel`; updated `cn` import to `@/lib/utils`. Added `tabsListVariants` supporting default and line variants with horizontal and vertical layout states.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/tabs.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- Tabs activation in Base UI is manual by default (keyboard arrows focus tabs, user activates by Enter/Space or click), matching accessible WAI-ARIA tab standards.

## Verify by hand

- Visit `/admin/lists` to switch between Departments, Positions, and Leaders tabs.
- Open the Employee Edit Dialog (`/admin/employees-management`) and Profile Dialog to verify switching between tabs and panels.
