# switch

2026-10-14, strategy: golden pair via CLI (shadcn add switch --overwrite), migrated successfully.

## Changed

- [switch.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/switch.jsx): migrated from `@radix-ui/react-switch` to `@base-ui/react/switch`. Converted `data-[state=checked/unchecked]` to Base UI's native `data-checked` and `data-unchecked` hooks; updated `cn` import to `@/lib/utils`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/switch.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- None. Controlled `checked` and `onCheckedChange` signatures and behavior are preserved.

## Verify by hand

- Navigate to `/admin/role-permissions` and toggle any switch in the Permissions Matrix or Add Permission modal to confirm toggle action and state updates.
