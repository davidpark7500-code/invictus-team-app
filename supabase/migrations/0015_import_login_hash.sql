-- 0015: carry Pulse Board logins into the app, so members sign in with the email and password
-- they already use. scripts/copy-pulse-data.mjs reads each bcrypt hash from Pulse Board
-- (public.export_login_hashes() there, service role only) and hands it to this function.
-- Hashes move between the two databases as-is; no password is ever seen or stored in plain text.
--
-- Only touches accounts the copy created (email in private.invited_emails) that have never
-- signed in to the app, so it can't overwrite anyone who has already chosen a password here.

create or replace function public.import_login_hash(p_email text, p_hash text) returns boolean
  language plpgsql security definer set search_path = '' as $$
declare
  n int;
begin
  if p_hash !~ '^\$2[aby]\$[0-9]{2}\$.{53}$' then
    raise exception 'Not a bcrypt hash.';
  end if;
  update auth.users u
     set encrypted_password = p_hash, updated_at = now()
   where lower(u.email) = lower(trim(p_email))
     and u.last_sign_in_at is null
     and exists (select 1 from private.invited_emails i where i.email = lower(trim(p_email)));
  get diagnostics n = row_count;
  return n > 0;
end;
$$;
revoke all on function public.import_login_hash(text, text) from public, anon, authenticated;
grant execute on function public.import_login_hash(text, text) to service_role;
