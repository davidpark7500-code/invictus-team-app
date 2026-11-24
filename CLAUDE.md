@AGENTS.md

# Invictus Team app — project handoff

This is the replacement for the **Invictus Team** mobile app (current app: App Store id
6461012606, Android `com.hauflertechservices.invictus.android`, built by Haufler Technology
Services). Started in a cloud session; continued here on the owner's Mac so computer use and
the iOS simulator are available.

The owner wants an advisor, not an assistant: lead with problems, tag confidence on key
claims ([Certain] / [Likely] / [Guessing]), no filler praise.

## Decisions already made (do not re-litigate)

- **Leaderboard tab (Nov 2026):** Pulse Board's leaderboard moves into this app as a tab. Spec:
  `docs/LEADERBOARD-TAB-HANDOFF.md` in github.com/davidpark7500-code/pulse-board. This supersedes
  the "two shared logins" decision below: everyone gets a personal account, sign-up gated by a team
  code. The combined app gets a NEW Supabase project (owner must approve the cost first); the live
  Pulse Board project `popwjvdtkznhaudsogso` is never edited, only read at cutover.
  Built (merged to main): Leaderboard UI with placeholder data (`src/features/leaderboard/`),
  personal-account sign-in / sign-up with team code, migration 0004, push (`push.ts` +
  `supabase/functions/notify-sale`), data-copy script (`scripts/copy-pulse-data.mjs`).
  Setup and cutover steps: `docs/04-leaderboard-backend.md`.
  **Supabase project (created Nov 2026):** "Invictus Team", ref `yvhwqwtjrmwgudtbmgdf`, in the
  owner's paid org (~$10/month). Migrations 0001, 0003-0006 applied; content seeded from mock.ts.
  Team code set (hashed in `private.team_settings`; never write the code in this public repo).
  Email confirmation is OFF on purpose (the team code is the gate). Public URL and publishable key
  are in Vercel (production) and EAS (production) env, and in `.env.local` (not committed).
  Pulse Board data not copied yet; the Leaderboard still shows sample members.

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
- **(Superseded by personal accounts, see above.) Two logins only:** a shared `team` login everyone uses, and an `admin` login. No sign-up.
  Username maps to `<username>@EXPO_PUBLIC_LOGIN_DOMAIN`. See `supabase/migrations/0002_two_accounts.sql`.
  Because the login is shared, anything per-person (e.g. listening position) must be stored on-device.
- **Design = the leaderboard's design, app-wide (owner, Nov 2026):** colour glow behind every
  screen (`GlowBackground` at the root layout, screens transparent), translucent glass cards
  (`colors.cardGlass`, radius 22, hairline border), inputs 14, sheets 28, gold = memberships,
  blue = orders. The leaderboard ranks every team member; never fill it from the Profiles leaders.
- **Design (base):** Apple Liquid Glass on iOS 26 (`src/components/glass/Glass.tsx`), blur fallback,
  solid under Reduce Transparency. System / light / dark theme, persisted.
- **Brand:** the VI monogram (`assets/brand/`), ink-and-paper palette, black primary buttons in
  light mode and white in dark. One signature highlight colour, currently **placeholder gold**,
  set in the `BRAND` constant at the top of `src/theme/tokens.ts`. Light mode needs a darker
  text shade of it (≥ 4.5:1 contrast on white).
- **Tab headers (owner, Nov 2026):** every tab except Home starts with the Invictus logo at top
  left and the tab title beside it (`src/components/ui/TabHeader.tsx`), matching Leaderboard.
  Those tab stacks hide the native header on their first screen; detail screens keep it.
  The row is a fixed 44pt high and every tab pads its top the same way (`<Screen tabRoot>`,
  Leaderboard uses the same constants), so the logo lands on the same spot on every tab.
  Home has no "Home" title bar: big centred logo, Settings as a round glass button where
  Leaderboard's bell sits.
- **Glass on the web (Nov 2026):** a translucent panel only reads as glass with a lit top rim,
  a faint sheen and a soft shadow (`Glass.web.tsx`). Content cards don't blur (they sit on the
  smooth glow, where blur shows nothing, and a blur per card stutters on iPhone); the tab bar
  and header buttons do.
- **Cards are not Liquid Glass on iPhone (Nov 2026):** content cards (`Card`, the Leaderboard's
  panels) use `<Glass content>`: a translucent pane with the web's lit rim and sheen
  (`glass/rim.ts`). Real Liquid Glass smeared the glow into streaks at card edges and frosted
  the middle white. Liquid Glass stays on the tab bar and buttons.
- **Web shell (`public/index.html`):** app-coloured background and logo before the JS loads,
  Safari bars in the app's colour, full-screen "Add to Home Screen" app (`manifest.json`,
  `public/icons/`).
- **Editing content without an app update (owner, Nov 2026):** resources, events, team profiles
  (bios) and the Home welcome text (`app_text.welcome`) live in Supabase; admins edit them in the
  dashboard's Table Editor. New PDFs go in the private `resources` Storage bucket, then the file
  name goes in that resource's `storage_path`. `src/data/content.tsx` loads it on sign-in and
  each time the app comes to the front, keeps the last copy on the phone, and falls back to
  `mock.ts`. Code changes reach phones with `eas update --channel production --environment
  production` (EAS Update); bump `version` in app.json whenever native modules change.
- **Admin editing in the app (owner, Nov 2026):** admins see Edit profile on each profile
  (photo, names, pin, Founders/Qual, bio). Photos go to the public `team-photos` bucket (admins
  write; migrations 0009/0010), resized to 900px JPEG, a new file per upload. Saves update
  `team_profiles`; everyone sees them on next open. Needs expo-image-picker (native, app 0.2.0+).
  Several photos per profile (`team_profiles.photos`, migration 0011): swiped through on the
  profile and share page (`PhotoGallery`, arrows on the web); the first is the main photo and
  `photo_url` mirrors it. Edit profile adds up to 10 at a time, removes, and sets the main one.
- **Pins are free text (owner, Nov 2026):** Edit profile has one Pin line ("Founders Ruby Qual");
  saving clears the old founders/qualifying flags. The Profiles tab is one list in
  `team_profiles.sort_order` (the old app's order), not grouped by pin (owner, Nov 2026).
- **Add to calendar:** iPhone/Android open the system Add Event screen, prefilled
  (`expo-calendar/legacy` createEventInCalendarAsync, no permission prompt; app 0.3.0+). Web
  downloads an .ics file. Date-only events become all-day entries.
- **Prospect share links:** Share with a prospect makes a 7-day link
  (`create_profile_share`), opened at `/p/<token>` without sign-in (`shared_profile_page`).
  Admins turn a link off by setting `revoked_at` in `profile_shares`.
- **Notifications (owner, Nov 2026):** Account sheet > Notifications: New events, New resources
  (team updates) and the two sale alerts, saved per person on `profiles.notify_*`. Database
  triggers (migration 0007, pg_net) call the Edge Functions `notify-content` and `notify-sale`
  with a shared secret checked by `notify_secret_ok()`; no dashboard webhooks. An event or
  resource notifies once, when it's added published or first published. Tapping a notification
  opens its screen (`data.url`). iOS delivery needs an APNs key in the project's EAS credentials.
- **One account button (owner, Nov 2026):** the person's initials, top right on every tab (same
  spot on Home), open `/account`: profile, Notifications (sale alerts), Appearance, sign out. It
  replaced Home's settings gear and Leaderboard's bell. Sign-in covers the whole app, not just the
  Leaderboard (demo mode lets everyone in until Supabase exists).
- **Style sheet:** `docs/style-sheet.html`, regenerated from the values in tokens.ts by hand.
- **Resource PDFs live in the app (owner, Nov 2026):** `public/docs/`, served by the app's website
  and linked with `appDoc()` in `src/data/mock.ts`; the iPhone app loads them from the live site,
  so a new or changed PDF needs a push to `main`. The repo is public, so these files are too.
  Videos, the CNA Template and the Onboarding Guide still come from the owner's Dropbox. The
  Launch Checklist still shows the old app's shared login; the owner will update these PDFs later.
- **Guest registration (owner, Nov 2026):** one Eventbrite page (`GUEST_REGISTRATION_URL` in
  `src/data/mock.ts`). It's the "Guest Registration Link" resource, the Register button on every
  Group Evaluation, and a "Register a guest" button on Home's card for the next Group Evaluation
  (shown even when another event is sooner).

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

## Status (latest)

- Code lives at github.com/davidpark7500-code/invictus-team-app, branch `main`. Push there;
  Vercel deploys every push to `main` automatically (config in `vercel.json`: builds the web
  version with `npx expo export --platform web`, serves `dist/`, SPA rewrite).
- **Open item:** the owner imported the repo into Vercel, but `invictus-team-app.vercel.app`
  returned 404 DEPLOYMENT_NOT_FOUND. Either Vercel assigned a different domain or the build
  failed. First job in a Mac session with Claude in Chrome: open the Vercel project, read the
  deployment status / build logs, fix any build error, and report the live URL.
- All 19 videos (7 talks, 12 profile videos) stream from the owner's public Dropbox folder link
  in-app; not yet tested on a phone.
- Still waiting on the owner for: Quick Links and Onboarding PDFs, profile photos and bios, the
  original team photo. Only on-screen CNA items. Ask before importing anything.
- Sign-in (Supabase) and profile share links are not built yet. Events are real but hand-entered
  in `mock.ts` until Supabase holds them.

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

In `src/data/mock.ts`, resource titles, profile names/pins, the welcome text and the events are
real. Events came from the old app's Events tab on 2026-11-23, which shows dates only, so they show
"Time TBD" until times are added (`startsAt` / `endsAt`). Announcements are still invented; never
ship those.

## Still open

- Real Supabase project (`.env.example`), storage buckets for audio / PDFs / leader photos.
- Audio playback (expo-audio, background mode is already in app.json), lock-screen controls,
  on-device resume position.
- PDFs (done, Nov 2026): open full screen inside the app with the title and a Share button, like
  the old app. Web draws the pages with pdf.js (`PdfViewer.web.tsx`, loaded at runtime from
  `public/pdfjs/`, copied by `scripts/copy-pdfjs.mjs` on `npm install`, not committed). iPhone and
  Android use `react-native-webview`, which shows the system's own PDF viewer (`PdfViewer.tsx`).
- Admin content management (who uploads audio, PDFs, events).
- A vector version of the logo (current source is 512 px; icons are upscaled).

- Written sign-off from Invictus leadership / LTD on distributing team materials.
- GitHub repo `davidpark7500-code/invictus-team-app` doesn't exist yet; create it and push.

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo start      # i = iOS simulator, a = Android, w = web
```
