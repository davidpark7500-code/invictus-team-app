-- Security advisor fixes (Nov 2026).
-- Only the sign-up trigger runs this; nobody calls it directly.
revoke all on function public.handle_new_user() from public, anon, authenticated;
-- Row rules call is_admin() for signed-in members; signed-out visitors never need it.
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
-- Left callable on purpose: shared_profile (the public share page), admin_* (they check
-- is_admin() themselves), is_team_member (row rules).
