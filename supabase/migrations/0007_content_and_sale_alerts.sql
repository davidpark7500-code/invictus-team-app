-- Push alerts for new events and new resources, and sale alerts wired up without a
-- dashboard webhook: database triggers call the Edge Functions directly through pg_net.
--
-- Each trigger sends a shared secret (kept in the private schema, never exposed to the
-- API). The functions check it with notify_secret_ok(), which only the service role can call.

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------- preferences
alter table public.profiles add column if not exists notify_events boolean not null default true;
alter table public.profiles add column if not exists notify_resources boolean not null default true;

-- Send each item's alert once, even if a trigger fires twice.
alter table public.events add column if not exists notified_at timestamptz;
alter table public.resources add column if not exists notified_at timestamptz;

-- ---------------------------------------------------------------- shared secret
create table if not exists private.app_secrets (
  name  text primary key,
  value text not null
);
insert into private.app_secrets (name, value)
values ('notify', encode(extensions.gen_random_bytes(24), 'hex'))
on conflict (name) do nothing;

create or replace function public.notify_secret_ok(secret text) returns boolean
  language sql stable security definer set search_path = '' as
$$ select exists (select 1 from private.app_secrets where name = 'notify' and value = secret) $$;
revoke all on function public.notify_secret_ok(text) from public, anon, authenticated;
grant execute on function public.notify_secret_ok(text) to service_role;

-- ---------------------------------------------------------------- calling the functions
create or replace function private.call_function(fn text, payload jsonb) returns void
  language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://yvhwqwtjrmwgudtbmgdf.supabase.co/functions/v1/' || fn,
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-notify-secret', (select value from private.app_secrets where name = 'notify')
    ),
    body := payload
  );
end;
$$;

-- A published event or resource is new to the team when it's inserted published, or when
-- an unpublished draft gets published.
create or replace function private.on_new_content() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  if new.published and new.notified_at is null
     and (tg_op = 'INSERT' or coalesce(old.published, false) = false) then
    perform private.call_function('notify-content', jsonb_build_object('table', tg_table_name, 'id', new.id));
  end if;
  return new;
end;
$$;

drop trigger if exists events_notify on public.events;
create trigger events_notify after insert or update of published on public.events
  for each row execute function private.on_new_content();
drop trigger if exists resources_notify on public.resources;
create trigger resources_notify after insert or update of published on public.resources
  for each row execute function private.on_new_content();

-- Sale alerts: same path, in the payload shape notify-sale already reads.
create or replace function private.on_new_sale() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  perform private.call_function('notify-sale',
    jsonb_build_object('type', 'INSERT', 'table', 'sales', 'record', to_jsonb(new)));
  return new;
end;
$$;
drop trigger if exists sales_notify on public.sales;
create trigger sales_notify after insert on public.sales
  for each row execute function private.on_new_sale();
