# alert-dialog

2026-10-14, strategy: golden pair via CLI (shadcn add alert-dialog --overwrite), migrated successfully.

## Changed

- [alert-dialog.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/alert-dialog.jsx): migrated from `@radix-ui/react-alert-dialog` to `@base-ui/react/alert-dialog`. Replaced `Overlay` with `Backdrop` and `Content` with `Popup`; `AlertDialogCancel` now uses `AlertDialogPrimitive.Close` with `render={<Button variant={variant} size={size} />}`; `AlertDialogAction` delegates to Base UI `<Button>`; updated `cn` import to `@/lib/utils`. Added `AlertDialogMedia` slot.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/alert-dialog.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- In Base UI, `Action` has no primitive part and renders as an accessible styled Button. Dialog closing upon action should be explicitly controlled by consumer state if unmanaged.

## Verify by hand

- Click "Log Out" in the user dropdown to open the Logout Confirmation Alert Dialog; confirm Cancel dismisses and Confirm triggers logout.
- In `/admin/account-logins`, test the Delete Account confirmation modal.
