# Invictus Team

Replacement for the Invictus Team mobile app (iOS + Android), rebuilt from scratch with
Expo Router and Supabase, designed around Apple's Liquid Glass with full light and dark mode.

Status: **foundation**. Every tab renders on placeholder data; no backend is wired yet.

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
| `src/app/(tabs)/_layout.tsx` | Native tab bar (Home, Audio, Resources, Events, List), mini player as bottom accessory on iOS 26 |
| `src/app/(tabs)/*` | One stack per tab with large titles and glass headers |
| `src/components/glass/Glass.tsx` | The glass surface: UIGlassEffect on iOS 26, blur elsewhere, solid under Reduce Transparency |
| `src/components/ui/*` | Text scale, Icon (SF Symbols / Material Symbols), Card, ListRow, Pill, Button, Screen |
| `src/theme/*` | Tokens and the light / dark / system theme provider (persisted) |
| `src/data/*` | Domain types reverse-engineered from the old app, plus placeholder content |
| `src/features/*` | Audio player state and List Builder pieces |
| `src/lib/supabase.ts` | Client; app runs in demo mode until `.env.local` is filled |
| `supabase/migrations` | Schema for the real backend |
| `docs/` | Reverse-engineering notes and open questions |

## Configure the backend

1. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Copy `.env.example` to `.env.local` and fill in the URL and anon key.
3. Restart `expo start`. Sign-in becomes real; demo mode turns off.

## Checks

```bash
npx tsc --noEmit
npx expo lint
```
