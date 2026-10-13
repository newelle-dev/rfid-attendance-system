# dialog

2026-10-14, strategy: golden pair via CLI (shadcn add dialog --overwrite), migrated successfully.

## Changed

- [dialog.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/dialog.jsx): migrated from `@radix-ui/react-dialog` to `@base-ui/react/dialog`. Replaced `Overlay` with `Backdrop` and `Content` with `Popup`; updated close buttons to use Base UI `render` prop with `<Button variant="ghost" ... />`; updated `cn` import to `@/lib/utils`.
- [AddPermissionDialog.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/role-permissions/AddPermissionDialog.jsx#L101-L108): migrated `<DialogTrigger asChild>` with `<Button>` to `<DialogTrigger render={<Button ... />}>`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/dialog.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- None. Focus management, backdrop click to dismiss, and ESC dismissal work out of the box with accessibility attributes intact.

## Verify by hand

- Click "Add Permission" on `/admin/role-permissions` to open the modal; verify backdrop blur, close button, and outside click dismissal.
- Test Profile Dialog and Add/Edit Employee modals.
