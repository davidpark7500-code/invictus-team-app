-- Brings the Leaderboard in line with Pulse Board as of Nov 24 2026:
--   * scoring: 1 point per membership, 2 points per $150+ order ("points" column);
--   * remove_my_sales(): a member lowers THIS week's count after tapping too many times;
--   * names are 1 to 60 characters (members can edit their own).

-- Board RPCs gain a points column (return type changes, so drop and recreate).
drop function if exists public.leaderboard(date);
create function public.leaderboard(p_week date)
returns table (user_id uuid, full_name text, memberships int, orders int, total int, points int, photo_url text)
language sql stable set search_path = public as $$
  with b as (select public.week_start(p_week) as s)
  select p.id, p.full_name,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int,
         count(s.id)::int,
         ((count(s.id) filter (where s.kind = 'membership')) + 2 * (count(s.id) filter (where s.kind = 'order')))::int,
         p.photo_url
  from public.profiles p
  cross join b
  left join public.sales s on s.user_id = p.id and s.sale_date >= b.s and s.sale_date < b.s + 7
  group by p.id, p.full_name, p.photo_url
$$;

drop function if exists public.leaderboard_all_time();
create function public.leaderboard_all_time()
returns table (user_id uuid, full_name text, memberships int, orders int, total int, points int, photo_url text)
language sql stable set search_path = public as $$
  select p.id, p.full_name,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int,
         count(s.id)::int,
         ((count(s.id) filter (where s.kind = 'membership')) + 2 * (count(s.id) filter (where s.kind = 'order')))::int,
         p.photo_url
  from public.profiles p
  left join public.sales s on s.user_id = p.id
  group by p.id, p.full_name, p.photo_url
$$;

revoke all on function public.leaderboard(date) from public, anon;
revoke all on function public.leaderboard_all_time() from public, anon;
grant execute on function public.leaderboard(date) to authenticated;
grant execute on function public.leaderboard_all_time() to authenticated;

-- Exports gain points too.
drop function if exists public.admin_export_weekly(date, date);
create function public.admin_export_weekly(p_from date, p_through date)
returns table (week_start date, week_end date, full_name text, email text, memberships int, orders int, total int, points int)
language sql stable security definer set search_path = public as $$
  select w::date, (w::date + 6), p.full_name, u.email::text,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int,
         count(s.id)::int,
         ((count(s.id) filter (where s.kind = 'membership')) + 2 * (count(s.id) filter (where s.kind = 'order')))::int
  from generate_series(public.week_start(p_from)::timestamp, public.week_start(p_through)::timestamp, interval '7 days') w
  cross join public.profiles p
  join auth.users u on u.id = p.id
  left join public.sales s on s.user_id = p.id and s.sale_date >= w::date and s.sale_date < w::date + 7
  where public.is_admin()
  group by w, p.id, p.full_name, u.email
  order by w, p.full_name
$$;

drop function if exists public.admin_export_totals();
create function public.admin_export_totals()
returns table (full_name text, email text, role text, joined date, memberships int, orders int, total int, points int)
language sql stable security definer set search_path = public as $$
  select p.full_name, u.email::text, p.role, p.created_at::date,
         (count(s.id) filter (where s.kind = 'membership'))::int,
         (count(s.id) filter (where s.kind = 'order'))::int,
         count(s.id)::int,
         ((count(s.id) filter (where s.kind = 'membership')) + 2 * (count(s.id) filter (where s.kind = 'order')))::int
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.sales s on s.user_id = p.id
  where public.is_admin()
  group by p.id, p.full_name, u.email, p.role, p.created_at
  order by ((count(s.id) filter (where s.kind = 'membership')) + 2 * (count(s.id) filter (where s.kind = 'order'))) desc, p.full_name
$$;

revoke all on function public.admin_export_weekly(date, date) from public, anon;
revoke all on function public.admin_export_totals() from public, anon;
grant execute on function public.admin_export_weekly(date, date) to authenticated;
grant execute on function public.admin_export_totals() to authenticated;

-- Fix this week's count: remove the signed-in person's most recent sales of one kind, this week only.
create or replace function public.remove_my_sales(p_kind public.sale_kind, p_count int)
returns int language plpgsql security definer set search_path = '' as $$
declare
  v_week date := public.week_start((now() at time zone 'America/Chicago')::date);
  v_removed int;
begin
  if (select auth.uid()) is null then raise exception 'Not signed in.'; end if;
  if p_count is null or p_count < 1 or p_count > 100 then raise exception 'Pick between 1 and 100.'; end if;
  with doomed as (
    select id from public.sales
     where user_id = (select auth.uid()) and kind = p_kind
       and sale_date >= v_week and sale_date < v_week + 7
     order by created_at desc
     limit p_count)
  delete from public.sales s using doomed where s.id = doomed.id;
  get diagnostics v_removed = row_count;
  return v_removed;
end;
$$;
revoke all on function public.remove_my_sales(public.sale_kind, int) from public, anon;
grant execute on function public.remove_my_sales(public.sale_kind, int) to authenticated;

-- Names: members edit their own (e.g. to add a partner); 1 to 60 characters.
alter table public.profiles drop constraint if exists profiles_full_name_length;
alter table public.profiles
  add constraint profiles_full_name_length check (char_length(btrim(full_name)) between 1 and 60);
