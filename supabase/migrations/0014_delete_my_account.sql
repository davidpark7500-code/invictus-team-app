-- 0014: in-app account deletion (required by the App Store, guideline 5.1.1(v), and Google Play).
--
-- Deletes the signed-in person's sign-in record. Everything of theirs goes with it through the
-- existing ON DELETE CASCADE chain: profile, sales (so they leave the Leaderboard), prospects,
-- customers and push tokens; share links they made keep working but lose their creator. The app
-- removes their profile photos from storage first (storage rows can't be deleted from SQL).

create or replace function public.delete_my_account() returns void
  language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := auth.uid();
begin
  if v_id is null then
    raise exception 'Not signed in.';
  end if;
  delete from auth.users where id = v_id;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
