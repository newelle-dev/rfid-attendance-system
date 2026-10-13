# form

2026-10-14, strategy: transformation engine, migrated successfully.

## Changed

- [form.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/form.jsx): removed `@radix-ui/react-slot` dependency from `FormControl`; implemented native React element cloning supporting both polymorphic `render` and standard `children` patterns while preserving accessibility attributes (`aria-describedby`, `aria-invalid`, `data-slot`).
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/form.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- None.

## Verify by hand

- Test form inputs and validation errors on `/admin/login` and `/admin/accounts` Add Account form.
