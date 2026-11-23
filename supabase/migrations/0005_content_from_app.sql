-- Content the app used to carry in src/data/mock.ts now lives here, so admins can
-- edit it in the Supabase dashboard (Table Editor, Storage) without an app update.
-- Rows keep the app's readable ids (`slug`, e.g. 'r-budget') so links and routes don't change.

-- ---------------------------------------------------------------- resources
alter table public.resources add column if not exists slug text unique;
alter table public.resources add column if not exists source text;
alter table public.resources alter column published set default true;
comment on column public.resources.url is 'Web address of the file or link. Leave empty when the file is in Storage (storage_path).';
comment on column public.resources.storage_path is 'Path in the private "resources" Storage bucket, e.g. "level-up.pdf". Wins over url; the app opens it with a short-lived signed link.';
comment on column public.resources.section is 'Quick Links, Onboarding Talks, CNA Resources or Onboarding (shown in that order).';
comment on column public.resources.sort_order is 'Order inside the section, smallest first.';

-- ---------------------------------------------------------------- events
alter table public.events add column if not exists slug text unique;
comment on column public.events.event_date is 'Calendar date (YYYY-MM-DD). Set starts_at / ends_at too once the time is known.';

-- ---------------------------------------------------------------- team profiles
alter table public.team_profiles add column if not exists slug text unique;
alter table public.team_profiles add column if not exists video_url text;
alter table public.team_profiles add column if not exists photo_url text;
alter table public.team_profiles add column if not exists video_source text;
comment on column public.team_profiles.bio is 'Shown on the profile page. Blank paragraphs separate paragraphs.';
comment on column public.team_profiles.pin is 'EDC, Emerald, Sapphire, Ruby or Platinum (grouping on the Profiles tab).';

-- ---------------------------------------------------------------- app text (welcome etc.)
create table if not exists public.app_text (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);
comment on table public.app_text is 'Editable copy. welcome = Home welcome card; a blank line starts a new paragraph.';
alter table public.app_text enable row level security;
create policy "app_text: team reads" on public.app_text for select to authenticated using (public.is_team_member());
create policy "app_text: admins write" on public.app_text for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- private files
-- PDFs and other team-only files. Members read through signed links; admins upload.
insert into storage.buckets (id, name, public, file_size_limit)
values ('resources', 'resources', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

create policy resources_team_read on storage.objects for select to authenticated
  using (bucket_id = 'resources' and public.is_team_member());
create policy resources_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'resources' and public.is_admin());
create policy resources_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'resources' and public.is_admin()) with check (bucket_id = 'resources' and public.is_admin());
create policy resources_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'resources' and public.is_admin());
