# button

2026-10-14, strategy: golden pair via CLI (shadcn add button --overwrite), migrated successfully.

## Changed

- [button.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/button.jsx): replaced `@radix-ui/react-slot` with `@base-ui/react/button` (`ButtonPrimitive`), pointed utils import to `@/lib/utils`.
- [QuickAction.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/dashboard/QuickAction.jsx#L30-L38): migrated `asChild` call site on `<Button>` to `render={<Link href="/admin/attendance-logs" />}`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/button.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Click primary, secondary, and link buttons across dashboard and navigation.
- Verify quick action button navigation works smoothly via the `render` prop Link element.
