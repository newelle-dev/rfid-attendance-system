# avatar

2026-10-14, strategy: golden pair via CLI (shadcn add avatar --overwrite), migrated successfully.

## Changed

- [avatar.jsx](file:///c:/Users/alec/OneDrive/Desktop/Projects/rfid-attendance-system/components/ui/avatar.jsx): migrated from `@radix-ui/react-avatar` to `@base-ui/react/avatar`. Gained `AvatarBadge`, `AvatarGroup`, and `AvatarGroupCount` helpers; updated `cn` import to `@/lib/utils`.
- Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" components/ui/avatar.jsx` returns 0 matches).

## Left alone

- None.

## Behavior changes

- None. Call sites pass standard `src` and `alt` props which Base UI handles natively with smooth fallback transitions.

## Verify by hand

- Check employee list table avatars and the header profile dropdown avatar to confirm employee photos and letter fallbacks render neatly.
