-- Combined Invictus Team app: personal accounts (sign-up gated by a team code)
-- plus Pulse Board's leaderboard. Run on the NEW project after 0001 and 0003.
-- Source for the leaderboard objects: pulse-board/supabase/schema.sql.
-- 0002_two_accounts.sql (shared logins) was removed: everyone gets their own account.

create extension if not exists pgcrypto with schema extensions;

-- ============================================================
-- TEAM CODE — sign-up must carry the code in user metadata (team_code).
-- Stored hashed in a schema the API can't reach. Accounts created by the
-- one-time data copy are marked app_metadata.invited = true (only the
-- service role can set app_metadata) and skip the check.
-- Set it after running this file:
--   insert into private.team_settings (id, team_code_hash)
--   values (1, extensions.crypt(upper('THE-CODE'), extensions.gen_salt('bf')))  -- codes are case-insensitive
--   on conflict (id) do update set team_code_hash = excluded.team_code_hash;
-- ============================================================
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.team_settings (
  id             int primary key default 1 check (id = 1),
  team_code_hash text not null
);

create or replace function public.check_team_code() returns trigger
  language plpgsql security definer set search_path = public, extensions as $$
declare
  v_code text := trim(coalesce(new.raw_user_meta_data ->> 'team_code', ''));
  v_hash text;
begin
  -- Reserved domains can never receive mail; only scanners and bots use them.
  if lower(new.email) ~ '\.(invalid|test|example|localhost)$' then
    raise exception 'That email address cannot be used.';
  end if;
  if coalesce((new.raw_app_meta_data ->> 'invited')::boolean, false) then
    return new;
  end if;
  select team_code_hash into v_hash from private.team_settings where id = 1;
  if v_hash is null or v_code = '' or extensions.crypt(upper(v_code), v_hash) <> v_hash then
    raise exception 'That team code isn''t right.';
  end if;
  -- Don't keep the code on the user record.
  new.raw_user_meta_data := new.raw_user_meta_data - 'team_code';
  return new;
end;
$$;
revoke all on function public.check_team_code() from public, anon, authenticated;

drop trigger if exists check_team_code on auth.users;
create trigger check_team_code
  before insert on auth.users
  for each row execute function public.check_team_code();

-- ============================================================
-- PROFILES — extend the team app's table (no second profiles table).
-- ============================================================
alter table public.profiles add column if not exists notify_membership boolean not null default true;
alter table public.profiles add column if not exists notify_order boolean not null default true;
alter table public.profiles add column if not exists welcomed_at timestamptz;
alter table public.profiles add column if not exists photo_url text;

-- Name from sign-up ("David & Samantha Park"), else the email's local part. Everyone starts
-- as a member; admins are promoted explicitly by email (see the end of this file).
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

-- A signed-in client can never change its own id or role. The service role and SQL can.
create or replace function public.profiles_lock_role() returns trigger
  language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    new.id := old.id;
    new.role := old.role;
  end if;
  return new;
end;
$$;
revoke all on function public.profiles_lock_role() from public, anon, authenticated;
drop trigger if exists profiles_lock_role_trigger on public.profiles;
create trigger profiles_lock_role_trigger
  before update on public.profiles
  for each row execute function public.profiles_lock_role();

drop policy if exists "profiles: update self" on public.profiles;
create policy "profiles: update self" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ============================================================
-- CONTENT — readable only by team members (someone with a profile), not just
-- any authenticated session.
-- ============================================================
create or replace function public.is_team_member() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = (select auth.uid())) $$;
revoke all on function public.is_team_member() from public, anon;
grant execute on function public.is_team_member() to authenticated;

drop policy if exists "resources: members read published" on public.resources;
create policy "resources: team reads published" on public.resources for select to authenticated
  using (public.is_team_member() and (published or public.is_admin()));
drop policy if exists "events: members read published" on public.events;
create policy "events: team reads published" on public.events for select to authenticated
  using (public.is_team_member() and (published or public.is_admin()));
drop policy if exists "leaders: members read" on public.team_profiles;
create policy "team_profiles: team reads" on public.team_profiles for select to authenticated
  using (public.is_team_member());
drop policy if exists "shares: members create" on public.profile_shares;
create policy "shares: team creates" on public.profile_shares for insert to authenticated
  with check (public.is_team_member());
drop policy if exists "shares: members read" on public.profile_shares;
create policy "shares: team reads" on public.profile_shares for select to authenticated
  using (public.is_team_member());
drop policy if exists "announcements: members read" on public.announcements;
create policy "announcements: team reads" on public.announcements for select to authenticated
  using (public.is_team_member());

-- ============================================================
-- SALES — one row per tap. sale_date is the seller's local day.
-- legacy_id = the sale's id in the old Pulse Board project (data copy only).
-- ============================================================
do $$ begin
  create type public.sale_kind as enum ('membership', 'order');
exception when duplicate_object then null; end $$;

create table if not exists public.sales (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind        public.sale_kind not null,
  sale_date   date not null,
  created_at  timestamptz not null default now(),
  notified_at timestamptz,
  legacy_id   uuid unique
);
create index if not exists sales_user_date_idx on public.sales (user_id, sale_date);
create index if not exists sales_date_idx on public.sales (sale_date);
create index if not exists sales_created_idx on public.sales (created_at desc);

alter table public.sales enable row level security;
create policy sales_read on public.sales for select to authenticated using (public.is_team_member());
create policy sales_insert_self on public.sales for insert to authenticated
  with check (user_id = (select auth.uid()) and sale_date between current_date - 1 and current_date + 1);
-- Undo your own tap for 15 minutes; admins can remove any sale.
create policy sales_delete on public.sales for delete to authenticated
  using ((user_id = (select auth.uid()) and created_at > now() - interval '15 minutes') or public.is_admin());

alter publication supabase_realtime add table public.sales;

-- ============================================================
-- EXPO PUSH TOKENS — one row per device (replaces Pulse Board's Web Push table).
-- ============================================================
create table if not exists public.expo_push_tokens (
  token      text primary key,
  user_id    uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  platform   text,
  updated_at timestamptz not null default now()
);
create index if not exists expo_push_tokens_user_idx on public.expo_push_tokens (user_id);
alter table public.expo_push_tokens enable row level security;
create policy expo_push_tokens_self on public.expo_push_tokens for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ============================================================
-- READ RPCs (unchanged from Pulse Board). Weeks run Wednesday -> Tuesday.
-- ============================================================
create or replace function public.week_start(d date) returns date
  language sql immutable set search_path = '' as
$$ select d - ((extract(dow from d)::int + 4) % 7) $$;

create or replace function public.leaderboard(p_week date)
returns table (user_id uuid, full_name text, memberships int, orders int, total int, photo_url text)
language sql stable set search_path = public as $$
  with b as (select public.week_start(p_week) as s)
  select p.id, p.full_name,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int,
         count(s.id)::int,
         p.photo_url
  from public.profiles p
  cross join b
  left join public.sales s on s.user_id = p.id and s.sale_date >= b.s and s.sale_date < b.s + 7
  group by p.id, p.full_name, p.photo_url
$$;

create or replace function public.leaderboard_all_time()
returns table (user_id uuid, full_name text, memberships int, orders int, total int, photo_url text)
language sql stable set search_path = public as $$
  select p.id, p.full_name,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int,
         count(s.id)::int,
         p.photo_url
  from public.profiles p
  left join public.sales s on s.user_id = p.id
  group by p.id, p.full_name, p.photo_url
$$;

create or replace function public.weekly_history(p_user uuid, p_from date, p_through date)
returns table (week_start date, memberships int, orders int)
language sql stable set search_path = public as $$
  select w::date,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int
  from generate_series(public.week_start(p_from)::timestamp, public.week_start(p_through)::timestamp, interval '7 days') w
  left join public.sales s
    on s.user_id = p_user and s.sale_date >= w::date and s.sale_date < w::date + 7
  group by w
  order by w
$$;

-- ============================================================
-- ADMIN RPCs (unchanged from Pulse Board)
-- ============================================================
create or replace function public.admin_list_members()
returns table (id uuid, full_name text, email text, role text, created_at timestamptz, total_sales int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  return query
    select p.id, p.full_name, u.email::text, p.role, p.created_at,
           (select count(*)::int from public.sales s where s.user_id = p.id)
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at;
end;
$$;

create or replace function public.admin_export_weekly(p_from date, p_through date)
returns table (week_start date, week_end date, full_name text, email text, memberships int, orders int, total int)
language sql stable security definer set search_path = public as $$
  select w::date, (w::date + 6), p.full_name, u.email::text,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int,
         count(s.id)::int
  from generate_series(public.week_start(p_from)::timestamp, public.week_start(p_through)::timestamp, interval '7 days') w
  cross join public.profiles p
  join auth.users u on u.id = p.id
  left join public.sales s on s.user_id = p.id and s.sale_date >= w::date and s.sale_date < w::date + 7
  where public.is_admin()
  group by w, p.id, p.full_name, u.email
  order by w, p.full_name
$$;

create or replace function public.admin_export_totals()
returns table (full_name text, email text, role text, joined date, memberships int, orders int, total int)
language sql stable security definer set search_path = public as $$
  select p.full_name, u.email::text, p.role, p.created_at::date,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int,
         count(s.id)::int
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.sales s on s.user_id = p.id
  where public.is_admin()
  group by p.id, p.full_name, u.email, p.role, p.created_at
  order by count(s.id) desc, p.full_name
$$;

create or replace function public.admin_remove_member(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  if p_user = (select auth.uid()) then raise exception 'You can''t remove yourself.'; end if;
  if exists (select 1 from public.profiles where id = p_user and role = 'admin') then
    raise exception 'You can''t remove another admin.';
  end if;
  delete from auth.users where id = p_user;
end;
$$;

revoke all on function public.week_start(date) from public, anon;
revoke all on function public.leaderboard(date) from public, anon;
revoke all on function public.leaderboard_all_time() from public, anon;
revoke all on function public.weekly_history(uuid, date, date) from public, anon;
revoke all on function public.admin_list_members() from public, anon;
revoke all on function public.admin_remove_member(uuid) from public, anon;
revoke all on function public.admin_export_weekly(date, date) from public, anon;
revoke all on function public.admin_export_totals() from public, anon;
grant execute on function public.week_start(date) to authenticated;
grant execute on function public.leaderboard(date) to authenticated;
grant execute on function public.leaderboard_all_time() to authenticated;
grant execute on function public.weekly_history(uuid, date, date) to authenticated;
grant execute on function public.admin_list_members() to authenticated;
grant execute on function public.admin_remove_member(uuid) to authenticated;
grant execute on function public.admin_export_weekly(date, date) to authenticated;
grant execute on function public.admin_export_totals() to authenticated;

-- ============================================================
-- PROFILE PHOTOS — public "avatars" bucket, each person writes only their own folder.
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy avatars_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_update_own on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ============================================================
-- FIRST ADMINS — after the current admins exist in this project, run:
--   update public.profiles set role = 'admin'
--   where id in (select id from auth.users where email in ('admin1@...', 'admin2@...'));
-- ============================================================
