# badge

2026-10-14, strategy: golden pair via CLI (shadcn add badge --overwrite), migrated successfully.

## Changed

- [badge.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/badge.jsx): replaced `@radix-ui/react-slot` with `@base-ui/react/use-render` and `@base-ui/react/merge-props`; updated `cn` import to `@/lib/utils`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/badge.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- None. Supports standard polymorphic rendering through Base UI's `render` prop while defaulting to `span`.

## Verify by hand

- Inspect badges displayed on employee status tables, attendance logs, and accounts to ensure pill styling and colors render correctly.
