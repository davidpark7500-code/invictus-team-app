-- Invictus Team app: initial schema.
-- Content tables are readable by every signed-in member and writable by admins.
-- List Builder tables are private per member.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------- content
create table public.audios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  speaker text not null default '',
  series text not null default '',
  duration_sec integer not null default 0,
  recorded_at date,
  storage_path text not null,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('CNA', 'Roadmap', 'Plan', 'Training', 'Forms')),
  kind text not null check (kind in ('pdf', 'link', 'video')),
  summary text not null default '',
  url text,
  storage_path text,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('group_evaluation', 'team_training', 'conference', 'social')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null default '',
  is_virtual boolean not null default false,
  registration_url text,
  recording_url text,
  description text not null default '',
  published boolean not null default true
);

create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null default '',
  location text not null default '',
  story text not null default '',
  photo_path text,
  sort_order integer not null default 0
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  pinned boolean not null default false,
  posted_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- list builder (private)
create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  channel text not null default 'Other',
  location text not null default '',
  notes text not null default '',
  last_contacted_at date,
  next_follow_up_at date,
  tms boolean not null default false,
  dtm boolean not null default false,
  mg1 boolean not null default false,
  mg2 boolean not null default false,
  ge boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  channel text not null default 'Other',
  notes text not null default '',
  cna_completed boolean not null default false,
  samples text[] not null default '{}',
  products_ordered text[] not null default '{}',
  thank_you_sent boolean not null default false,
  next_steps text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listen_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  audio_id uuid not null references public.audios (id) on delete cascade,
  position_sec integer not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, audio_id)
);

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.audios enable row level security;
alter table public.resources enable row level security;
alter table public.events enable row level security;
alter table public.leaders enable row level security;
alter table public.announcements enable row level security;
alter table public.prospects enable row level security;
alter table public.customers enable row level security;
alter table public.listen_progress enable row level security;

create policy "profiles: read all members" on public.profiles for select to authenticated using (true);
create policy "profiles: update self" on public.profiles for update to authenticated using (id = auth.uid());

create policy "audios: members read published" on public.audios for select to authenticated using (published or public.is_admin());
create policy "audios: admins write" on public.audios for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "resources: members read published" on public.resources for select to authenticated using (published or public.is_admin());
create policy "resources: admins write" on public.resources for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "events: members read published" on public.events for select to authenticated using (published or public.is_admin());
create policy "events: admins write" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "leaders: members read" on public.leaders for select to authenticated using (true);
create policy "leaders: admins write" on public.leaders for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "announcements: members read" on public.announcements for select to authenticated using (true);
create policy "announcements: admins write" on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "prospects: owner only" on public.prospects for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "customers: owner only" on public.customers for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "listen_progress: owner only" on public.listen_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Storage: create private buckets "audio", "resources", "leaders" in the dashboard and
-- serve files through signed URLs from the app.
