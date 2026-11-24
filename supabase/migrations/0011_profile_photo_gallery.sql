-- Several photos per team profile, swiped through on the profile page and share page.
alter table public.team_profiles add column if not exists photos text[] not null default '{}';
comment on column public.team_profiles.photos is 'Photo addresses in display order (swipe on the profile). The first is the main photo; photo_url mirrors it.';
update public.team_profiles set photos = array[photo_url] where photo_url is not null and cardinality(photos) = 0;

-- The share page also gets the photo list.
drop function if exists public.shared_profile_page(text);
create function public.shared_profile_page(share_token text)
returns table (first_names text, last_name text, pin text, founders boolean, qualifying boolean,
               bio text, photo_url text, photos text[], video_url text, expires_at timestamptz)
  language sql stable security definer set search_path = public as $$
  select p.first_names, p.last_name, p.pin, p.founders, p.qualifying, p.bio, p.photo_url, p.photos, p.video_url, s.expires_at
  from public.profile_shares s
  join public.team_profiles p on p.id = s.profile_id
  where s.token = share_token and s.revoked_at is null and s.expires_at > now();
$$;
revoke all on function public.shared_profile_page(text) from public;
grant execute on function public.shared_profile_page(text) to anon, authenticated;
