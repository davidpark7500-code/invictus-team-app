-- Prospect share links for team profiles.
-- A member taps "Share with a prospect" on a profile; the app calls
-- create_profile_share(slug) and shares https://invictus-team-app.vercel.app/p/<token>.
-- The page (no sign-in) reads the profile through shared_profile(token) while the link
-- is live: 7 days, unless an admin sets revoked_at in the Table Editor.

alter table public.profile_shares
  add column if not exists created_by uuid default auth.uid() references public.profiles (id) on delete set null;

create or replace function public.create_profile_share(profile_slug text) returns text
  language plpgsql security definer set search_path = public, extensions as $$
declare
  v_id    uuid;
  v_token text;
begin
  if not public.is_team_member() then
    raise exception 'Only team members can share profiles.';
  end if;
  select id into v_id from public.team_profiles where slug = profile_slug or id::text = profile_slug;
  if v_id is null then
    raise exception 'Profile not found.';
  end if;
  insert into public.profile_shares (profile_id, created_by)
  values (v_id, auth.uid())
  returning token into v_token;
  return v_token;
end;
$$;
revoke all on function public.create_profile_share(text) from public, anon;
grant execute on function public.create_profile_share(text) to authenticated;

-- What the public page shows: the profile's public fields plus when the link runs out.
-- Nothing else from the profile row or the sharer is exposed.
create or replace function public.shared_profile_page(share_token text)
returns table (first_names text, last_name text, pin text, founders boolean, qualifying boolean,
               bio text, photo_url text, video_url text, expires_at timestamptz)
  language sql stable security definer set search_path = public as $$
  select p.first_names, p.last_name, p.pin, p.founders, p.qualifying, p.bio, p.photo_url, p.video_url, s.expires_at
  from public.profile_shares s
  join public.team_profiles p on p.id = s.profile_id
  where s.token = share_token and s.revoked_at is null and s.expires_at > now();
$$;
revoke all on function public.shared_profile_page(text) from public;
grant execute on function public.shared_profile_page(text) to anon, authenticated;
