# dropdown-menu

2026-10-14, strategy: golden pair via CLI (shadcn add dropdown-menu --overwrite), migrated successfully.

## Changed

- [dropdown-menu.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/dropdown-menu.jsx): migrated from `@radix-ui/react-dropdown-menu` to `@base-ui/react/menu` (`MenuPrimitive`). Restructured content into `Portal > Positioner > Popup`, mapped `Label` -> `GroupLabel`, `Sub` -> `SubmenuRoot`, `SubTrigger` -> `SubmenuTrigger`, `ItemIndicator` -> `CheckboxItemIndicator` / `RadioItemIndicator`; updated `cn` import to `@/lib/utils`.
- [EmployeeActions.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/employees/EmployeeActions.jsx#L36-L46): migrated `<DropdownMenuTrigger asChild>` with `<Button>` to `<DropdownMenuTrigger render={<Button ... />}>`.
- [ProfileDropdown.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/layout/ProfileDropdown.jsx#L68-L84): migrated `<DropdownMenuTrigger asChild>` with `<Button>` to `<DropdownMenuTrigger render={<Button ... />}>` and removed deprecated `forceMount` prop.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/dropdown-menu.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- In Base UI, Checkbox/Radio menu items do not automatically close the menu on selection by default (`closeOnClick` defaults to false), matching desktop menu behaviors. Regular menu items close on click as expected.

## Verify by hand

- Click the user avatar in the header to open the profile dropdown; test navigating to Profile and Logging out.
- In `/admin/employees-management`, click Export/Import to open the action dropdown and test export actions.
