# popover

2026-10-14, strategy: golden pair via CLI (shadcn add popover --overwrite), migrated successfully.

## Changed

- [popover.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/popover.jsx): migrated from `@radix-ui/react-popover` to `@base-ui/react/popover`. Replaced monolithic content with `Portal > Positioner > Popup` model, forwarding `align`, `alignOffset`, `side`, and `sideOffset`; added inert passthrough for `PopoverAnchor` and exported headers/titles; updated `cn` import to `@/lib/utils`.
- [date-picker-with-range.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/date-picker-with-range.jsx#L26-L49): migrated `<PopoverTrigger asChild>` with `<Button>` to `<PopoverTrigger render={<Button ... />}>`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/popover.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- None. Popover Anchor has no Base UI counterpart and is maintained as an inert passthrough.

## Verify by hand

- Click the date range picker in attendance logs to verify the calendar popover opens and positions beneath the trigger button.
