# tooltip

2026-10-14, strategy: golden pair via CLI (shadcn add tooltip --overwrite), migrated successfully.

## Changed

- [tooltip.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/tooltip.jsx): migrated from `@radix-ui/react-tooltip` to `@base-ui/react/tooltip`. Restructured content to `Portal > Positioner > Popup > Arrow` anatomy with explicit forwarding of `align`, `alignOffset`, `side`, and `sideOffset`; updated `cn` import to `@/lib/utils`.
- [SideNav.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/SideNav.jsx#L94): renamed `delayDuration={0}` to `delay={0}`; migrated `<TooltipTrigger asChild>` with `<Link>` to `<TooltipTrigger render={<Link ... />}>`.
- [SideNavSkeleton.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/SideNavSkeleton.jsx#L9): renamed `delayDuration={0}` to `delay={0}`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/tooltip.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- `delayDuration` prop renamed to `delay` per Base UI specification; skipDelay duration concept dropped.

## Verify by hand

- Hover over collapsed sidebar navigation icons in `/admin` to verify tooltips appear cleanly with arrow pointers on the right.
