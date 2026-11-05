-- Two accounts only: one shared team login and one admin login.
--
-- 1. In Supabase > Authentication > Providers > Email, turn OFF "Allow new users to sign up".
-- 2. In Authentication > Users > Add user, create both, with "Auto confirm" ticked:
--      team@invictus.app   (shared password everyone uses)
--      admin@invictus.app  (admin password)
--    The domain must match EXPO_PUBLIC_LOGIN_DOMAIN. People type only "team" or "admin".
-- 3. Run this file to make the admin an admin.

update public.profiles
set role = 'admin', full_name = 'Admin'
where id = (select id from auth.users where email = 'admin@invictus.app');

update public.profiles
set full_name = 'Invictus Team'
where id = (select id from auth.users where email = 'team@invictus.app');

-- The shared account must not be able to promote itself.
drop policy if exists "profiles: update self" on public.profiles;

-- To rotate the shared password when someone leaves:
-- Authentication > Users > team@invictus.app > Reset password, then tell the team.
--
-- prospects / customers / listen_progress are kept for the parked List Builder.
-- With a shared login they would be shared by everyone, so the app does not use them.
