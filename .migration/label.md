# label

2026-10-14, strategy: golden pair via CLI (shadcn add label --overwrite), migrated successfully.

## Changed

- [label.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/label.jsx): replaced `@radix-ui/react-label` Primitive with native semantic `<label>` element; updated `cn` import to `@/lib/utils`.
- [AddEditDialog.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/admin/lists/AddEditDialog.jsx#L7): updated rogue direct import of `@radix-ui/react-label` to use `@/components/ui/label`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/label.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- None. Native `<label>` preserves all HTML label functionality with zero runtime overhead.

## Verify by hand

- Click form labels across dialogs and forms (e.g. Add/Edit dialogs in lists) and confirm they focus the associated inputs.
