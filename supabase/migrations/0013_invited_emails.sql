-- 0013: let the Pulse Board data copy create accounts without the team code.
--
-- Supabase's admin "create user" writes the auth.users row BEFORE it adds app_metadata, so the
-- `invited` flag that check_team_code() looked for is never there when the trigger runs, and
-- every copied person was refused ("That team code isn't right."). Instead, the copy script
-- first records each Pulse Board email here (service role only), and the trigger lets those
-- emails through. Anyone else still needs the team code.

create table if not exists private.invited_emails (
  email      text primary key check (email = lower(email)),
  invited_at timestamptz not null default now()
);

-- Called by scripts/copy-pulse-data.mjs with the service-role key. Not callable from the app.
create or replace function public.invite_email(p_email text) returns void
  language sql security definer set search_path = private, public as $$
  insert into private.invited_emails (email) values (lower(trim(p_email)))
  on conflict (email) do nothing;
$$;
revoke all on function public.invite_email(text) from public, anon, authenticated;
grant execute on function public.invite_email(text) to service_role;

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
  -- People copied from Pulse Board (or otherwise invited) don't need the code.
  if coalesce((new.raw_app_meta_data ->> 'invited')::boolean, false)
     or exists (select 1 from private.invited_emails where email = lower(new.email)) then
    new.raw_user_meta_data := new.raw_user_meta_data - 'team_code';
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
