# Invictus Team

Replacement for the Invictus Team mobile app (iOS + Android), rebuilt from scratch with
Expo Router and Supabase, designed around Apple's Liquid Glass with full light and dark mode.

Status: **foundation**. Every tab renders on placeholder data; no backend is wired yet.

Accounts: two logins only. A shared **team** login everyone uses to browse content, and an
**admin** login for managing it. There is no sign-up.

Tabs shipped: Home, Audio, Resources, Events. The List Builder is parked in
`src/features/list/parked/` (not routed) until per-person accounts exist; list-building
ideas ship as a PDF under Resources instead.

## Run it

```bash
npm install
npx expo start
```

Press `i` for iOS simulator, `a` for Android, `w` for web. Liquid Glass needs iOS 26 on a
device or simulator built with Xcode 26; everything else gets a material-blur fallback.

Expo Go cannot run this project once native modules beyond its bundle are added. Use a
development build:

```bash
npx eas-cli@latest build --profile development --platform ios
```

## Layout

| Path | What |
|---|---|
| `src/app/_layout.tsx` | Root: theme, auth gate, player state, settings sheet |
| `src/app/(tabs)/_layout.tsx` | Native tab bar (Home, Audio, Resources, Events), mini player as bottom accessory on iOS 26 |
| `src/app/(tabs)/*` | One stack per tab with large titles and glass headers |
| `src/components/glass/Glass.tsx` | The glass surface: UIGlassEffect on iOS 26, blur elsewhere, solid under Reduce Transparency |
| `src/components/ui/*` | Text scale, Icon (SF Symbols / Material Symbols), Card, ListRow, Pill, Button, Screen |
| `src/theme/*` | Tokens and the light / dark / system theme provider (persisted) |
| `src/data/*` | Domain types reverse-engineered from the old app, plus placeholder content |
| `src/features/audio` | Audio player state and mini player |
| `src/features/list/parked` | List Builder screens, kept but not shipped |
| `src/lib/supabase.ts` | Client; app runs in demo mode until `.env.local` is filled |
| `supabase/migrations` | Schema for the real backend |
| `docs/` | Reverse-engineering notes and open questions |

## Configure the backend

1. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Turn off sign-ups and create the `team@…` and `admin@…` users, as described at the top of
   `supabase/migrations/0002_two_accounts.sql`, then run that file.
3. Copy `.env.example` to `.env.local` and fill in the URL, anon key, and login domain.
4. Restart `expo start`. Sign-in becomes real; demo mode turns off. People type `team` or `admin`.

## Checks

```bash
npx tsc --noEmit
npx expo lint
```
