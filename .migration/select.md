# select

2026-10-14, strategy: golden pair via CLI (shadcn add select --overwrite), migrated successfully.

## Changed

- [select.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/select.jsx): migrated from `@radix-ui/react-select` to `@base-ui/react/select`. Restructured from monolithic content to `SelectPrimitive.Portal > SelectPrimitive.Positioner > SelectPrimitive.Popup`, mapped `Viewport` to `List`, `Label` to `GroupLabel`, `ScrollUp/DownButton` to `ScrollUp/DownArrow`, and forwarded `alignItemWithTrigger`; updated `cn` import to `@/lib/utils`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/select.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- In Base UI Select, positioning and item alignment with the trigger are managed by `alignItemWithTrigger` on the Positioner instead of `position="popper" | "item-aligned"`.

## Verify by hand

- Test selecting departments and positions in `/admin/employees-management` Add/Edit employee modal.
- Test filters in `/admin/attendance-logs` and `/admin/accounts`.
