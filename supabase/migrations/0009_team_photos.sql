-- Profile photos, uploaded by admins from the app's Edit profile screen.
-- Public: photos show in the app and on prospect share pages (no sign-in there).
-- Only admins can add, replace or remove them. team_profiles.photo_url holds the public URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-photos', 'team-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy team_photos_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'team-photos' and public.is_admin());
create policy team_photos_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'team-photos' and public.is_admin()) with check (bucket_id = 'team-photos' and public.is_admin());
create policy team_photos_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'team-photos' and public.is_admin());

-- Admins can list team photos, which Storage needs to delete or replace them
-- (public viewing doesn't go through row rules). Applied as 0010 on the live project.
create policy team_photos_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'team-photos' and public.is_admin());
