@AGENTS.md

# Invictus Team app — project handoff

This is the replacement for the **Invictus Team** mobile app (current app: App Store id
6461012606, Android `com.hauflertechservices.invictus.android`, built by Haufler Technology
Services). Started in a cloud session; continued here on the owner's Mac so computer use and
the iOS simulator are available.

The owner wants an advisor, not an assistant: lead with problems, tag confidence on key
claims ([Certain] / [Likely] / [Guessing]), no filler praise.

## Decisions already made (do not re-litigate)

- **Stack:** Expo SDK 58 + Expo Router, React Native, Supabase. One codebase for iOS, Android, web.
- **Tabs shipped:** Home, Audio, Resources, Events. No fifth tab.
- **List Builder is parked**, not shipped. Code lives in `src/features/list/parked/` (not routed);
  types and DB tables stay. List-building ideas ship as a PDF under Resources instead.
- **Two logins only:** a shared `team` login everyone uses, and an `admin` login. No sign-up.
  Username maps to `<username>@EXPO_PUBLIC_LOGIN_DOMAIN`. See `supabase/migrations/0002_two_accounts.sql`.
  Because the login is shared, anything per-person (e.g. listening position) must be stored on-device.
- **Design:** Apple Liquid Glass on iOS 26 (`src/components/glass/Glass.tsx`), blur fallback,
  solid under Reduce Transparency. System / light / dark theme, persisted.
- **Brand:** the VI monogram (`assets/brand/`), ink-and-paper palette, black primary buttons in
  light mode and white in dark. One signature highlight colour, currently **placeholder gold**,
  set in the `BRAND` constant at the top of `src/theme/tokens.ts`. Light mode needs a darker
  text shade of it (≥ 4.5:1 contrast on white).
- **Style sheet:** `docs/style-sheet.html`, regenerated from the values in tokens.ts by hand.

## First task when the owner says "start"

Capture the current Invictus Team app so the new one has the right content.

1. Confirm computer use works by taking a screenshot. If it doesn't, tell the owner how to turn
   it on and stop.
2. Request access to **iPhone Mirroring**. Open it and open the **Invictus Team** app.
3. **The owner logs in themselves.** Never ask for, type, or store the password.
4. Visit every tab and every sub-screen. Screenshot each one into `docs/old-app/` with
   descriptive names (`01-home.png`, `02-resources.png`, ...). Scroll long screens fully.
5. Write `docs/03-old-app-capture.md` with:
   - tab names and order, and what each screen shows and does;
   - the main brand colour as a hex value, sampled from a screenshot (not guessed), plus any
     secondary colours;
   - every **leader**: display name exactly as written, pin level, city, full bio, and display
     order; save each leader photo crop to `docs/old-app/leaders/`;
   - the full list of **audio** titles, speakers and series; **resources** titles and categories;
     **events** shown;
   - anything the old app does that the new one doesn't, and anything that couldn't be captured.
6. Apply what you found:
   - set `BRAND` in `src/theme/tokens.ts` to the real colour (check contrast; derive a darker
     text shade for light mode), and update `docs/style-sheet.html`;
   - replace placeholder leaders in `src/data/mock.ts` with the real ones and build the
     **Leaders** section: a horizontal photo-card strip on Home that opens a leader detail
     screen (not a new tab);
   - replace placeholder audio / resource / event titles with the real ones.
7. Run `npx tsc --noEmit` and `npx expo lint`, run the app in the iOS simulator in light and dark
   mode, and show the owner screenshots. Commit.

Do not try to download the old app's audio files or PDFs from inside it. Full-quality originals
must come from Haufler or Invictus leadership; list what's needed in the capture doc.

## Placeholder content to replace

`src/data/mock.ts` is invented, including leader names, pin levels and bios. Never ship it.

## Still open

- Real Supabase project (`.env.example`), storage buckets for audio / PDFs / leader photos.
- Audio playback (expo-audio, background mode is already in app.json), lock-screen controls,
  on-device resume position.
- PDF viewer and share sheet on Resources.
- Admin content management (who uploads audio, PDFs, events).
- A vector version of the logo (current source is 512 px; icons are upscaled).
- Web build: the selected tab in the custom web tab bar doesn't highlight.
- Written sign-off from Invictus leadership / LTD on distributing team materials.
- GitHub repo `davidpark7500-code/invictus-team-app` doesn't exist yet; create it and push.

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo start      # i = iOS simulator, a = Android, w = web
```
