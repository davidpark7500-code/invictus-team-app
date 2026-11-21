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
- **Tabs shipped:** Home, Events, Profiles, Resources. No Audio tab: PDFs, audio, video and
  links all live in Resources. No More tab: sign-out is in Settings.
- **Content vs design:** screenshots of the current app say what content goes where; they are
  NOT a design reference. Keep our design and placeholder gold. Files come from the owner's
  "Invictus Team App" Dropbox folder. See `docs/03-content-map.md`.
- **Loehr and Sitzman** are no longer on the team: no profiles, no videos.
- **Profile sharing:** expiring (7-day) private links per profile, revocable by admin
  (migration 0003, `profile_shares`). Not built yet beyond the schema and a disabled button.
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

## Video hosting (decided: Dropbox originals for now)

Stream the **original** files straight from the owner's Dropbox. No compression for now.
Dropbox Essentials allows ~1 TB/day of shared-link traffic; expected use is 200–300 plays/day,
about 270 GB/day at ~1 GB per talk.
1. **Done:** all 19 video URLs point at the files' own addresses inside the owner's public
   "Invictus Team App" shared-folder link (no per-file links needed). `toDirectMediaUrl` turns each
   into a direct stream (`raw=1`). If that folder link is deleted or regenerated, every video breaks;
   switching it from edit to view-only should keep the same URLs. Not yet tested on a phone: the
   cloud container's network blocks dropbox.com.
2. In-app playback is built: `InlineVideo` (expo-video) plays inside the app with native controls,
   full screen, picture-in-picture and background audio. It never opens Dropbox.
3. Test "Know Your Resources" (2.8 GB) and one .MOV profile video on a phone over cellular,
   and on Android if available.
If start-up is slow or a .MOV won't play: preferred fallback is **Bunny Stream** (auto-encodes
uploads, about $35–40/month at 300 plays/day). Cloudflare Stream was about $275/month at that
volume. `scripts/convert-videos.sh` (720p copies) stays available but is optional.

## Status

Content titles, sections, names and pins are in from the screenshots. Waiting on the owner for:
the missing PDFs (Quick Links and Onboarding), profile photos and bios, the original team photo,
and linking the Dropbox video files (originals, no compression). All seven talk matches are confirmed. Only on-screen CNA items. Ask before importing anything.

## Capture task (only if the owner asks for more of the old app)

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

In `src/data/mock.ts`, resource titles, profile names/pins and the welcome text are real.
Events and announcements are still invented; never ship those.

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
