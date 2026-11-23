# Leaderboard backend: setup and cutover

Everything below is ready in the repo. Nothing has been created in Supabase yet: the
NEW project still needs creating (blocked from the cloud session; do it in the Supabase
dashboard or approve it from a Mac session).

## 1. Create the new project
- Supabase → New project in "David's Paid Organization", region **us-east-2**, name
  "Invictus Team App". Note its URL, anon key and service-role key.
- Never touch the live Pulse Board project `popwjvdtkznhaudsogso`.

## 2. Schema (SQL editor, in order)
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0003_resources_profiles_shares.sql`
3. `supabase/migrations/0004_personal_accounts_and_leaderboard.sql`
4. Set the team code (case-insensitive):
   ```sql
   insert into private.team_settings (id, team_code_hash)
   values (1, extensions.crypt(upper('YOUR-CODE'), extensions.gen_salt('bf')))
   on conflict (id) do update set team_code_hash = excluded.team_code_hash;
   ```
5. Authentication → Providers → Email: sign-ups **on**, confirm email **on**.
6. Authentication → SMTP: set up custom SMTP (e.g. Resend). The built-in sender is limited to a
   few emails an hour, far too few for the cutover reset emails.

Tested against a local Postgres 16 with Supabase stand-ins: team code (wrong / missing / right,
case-insensitive), reserved-domain block, data-copy accounts skip the code, clients can't change
their role, sales date and ownership rules, 15-minute undo, strangers see nothing, admin RPCs
refuse members, `week_start` Wed→Tue.

## 3. Push notifications
- App side: `src/features/leaderboard/push.ts` (permission, Expo push token → `expo_push_tokens`),
  opened from the bell on the Leaderboard tab. Needs an EAS project id in `app.json`
  (`expo.extra.eas.projectId`, created by `npx eas-cli init`) and a development or store build;
  Expo Go and the web build can't receive pushes.
- Server side: `supabase/functions/notify-sale` (type-checked with Deno, not yet run live).
  ```bash
  supabase functions deploy notify-sale --no-verify-jwt --project-ref <new-ref>
  supabase secrets set WEBHOOK_SECRET=<long random string> --project-ref <new-ref>
  ```
  Then Database → Webhooks → new webhook: table `public.sales`, event **Insert**, type
  Supabase Edge Function `notify-sale`, header `x-webhook-secret: <same string>`.
- Rules: opted-in teammates only, never the seller, once per sale (`notified_at`), dead tokens pruned,
  sales older than 2 minutes (e.g. copied history) never notify.

## 4. Data copy (on the Mac)
`scripts/copy-pulse-data.mjs`. Reads the live project, writes only the new one, refuses to run if
the "new" URL is the live project. Keys go in the shell, never in a file in the repo.
```bash
OLD_SUPABASE_URL=https://popwjvdtkznhaudsogso.supabase.co OLD_SERVICE_ROLE_KEY=... \
NEW_SUPABASE_URL=https://<new-ref>.supabase.co NEW_SERVICE_ROLE_KEY=... \
node scripts/copy-pulse-data.mjs            # dry run: counts only
# ...same env... node scripts/copy-pulse-data.mjs --apply     # copy + verify
# ...same env... node scripts/copy-pulse-data.mjs --verify    # verify only
```
Copies people (by email, marked invited), names, alert preferences, admin role, profile photos,
and sales (with `legacy_id`, so re-runs only add new ones), then compares every person's totals
for every week between old and new.

## 5. Cutover
1. Announce a short freeze. Run `--apply` once more for the final delta; verify shows all match.
2. Ship the app build (TestFlight / Play internal first).
3. `node scripts/copy-pulse-data.mjs --send-resets --redirect-to=<app reset link> --apply`
   to email everyone a password-reset link. Share the team code for new sign-ups.
4. Point pulseinvictus.com at a "we moved" notice. Pause (don't delete) the old project for ~30 days.

## Not built yet
Wiring the Leaderboard screen to the new project (it shows placeholder numbers), realtime feed,
Progress chart, Admin screen, welcome sheet, profile-photo upload, password-reset screen.
