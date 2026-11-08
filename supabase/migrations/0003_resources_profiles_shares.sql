-- Resources hold PDFs, audio, video and links in named sections; leaders become
-- profiles; profiles can be shared with prospects through expiring links.

-- ---------------------------------------------------------------- resources
alter table public.resources drop constraint if exists resources_category_check;
alter table public.resources drop constraint if exists resources_kind_check;
alter table public.resources rename column category to section;
alter table public.resources add constraint resources_kind_check check (kind in ('pdf', 'audio', 'video', 'link'));
alter table public.resources add column if not exists speaker text;
alter table public.resources add column if not exists duration_sec integer;
alter table public.resources add column if not exists sort_order integer not null default 0;
-- Audio now lives in resources; the separate catalogue is retired.
drop table if exists public.listen_progress;
drop table if exists public.audios;

-- ---------------------------------------------------------------- profiles
alter table public.leaders rename to team_profiles;
alter table public.team_profiles rename column name to last_name;
alter table public.team_profiles rename column story to bio;
alter table public.team_profiles drop column if exists location;
alter table public.team_profiles add column if not exists first_names text not null default '';
alter table public.team_profiles add column if not exists founders boolean not null default false;
alter table public.team_profiles add column if not exists qualifying boolean not null default false;
alter table public.team_profiles add column if not exists video_path text;

-- ---------------------------------------------------------------- share links
-- One row per link sent to a prospect. The public page looks up the token,
-- checks it hasn't expired or been revoked, and shows that profile only.
create table public.profile_shares (
  token text primary key default encode(gen_random_bytes(16), 'hex'),
  profile_id uuid not null references public.team_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  revoked_at timestamptz
);
alter table public.profile_shares enable row level security;
create policy "shares: members create" on public.profile_shares for insert to authenticated with check (true);
create policy "shares: members read" on public.profile_shares for select to authenticated using (true);
create policy "shares: admins revoke" on public.profile_shares for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Public lookup for the share page: returns the profile only while the link is live.
create or replace function public.shared_profile(share_token text)
returns setof public.team_profiles language sql stable security definer set search_path = public as $$
  select p.* from public.profile_shares s
  join public.team_profiles p on p.id = s.profile_id
  where s.token = share_token and s.revoked_at is null and s.expires_at > now();
$$;
grant execute on function public.shared_profile(text) to anon;
