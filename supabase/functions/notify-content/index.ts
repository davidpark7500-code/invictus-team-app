// Supabase Edge Function: push a notification when a new event or resource is published.
// Called by database triggers (migration 0007) with { table: 'events' | 'resources', id }.
//
// - notifies everyone who opted in (profiles.notify_events / notify_resources)
// - sends at most once per item (claims notified_at atomically)
// - prunes device tokens Expo reports as no longer registered
//
// The caller proves itself with the shared secret in "x-notify-secret", checked by
// public.notify_secret_ok() (service role only). SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

type Kind = 'events' | 'resources';

Deno.serve(async (req) => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const { data: ok } = await db.rpc('notify_secret_ok', { secret: req.headers.get('x-notify-secret') ?? '' });
  if (ok !== true) return new Response('forbidden', { status: 403 });

  const body = await req.json().catch(() => null);
  const table = body?.table as Kind | undefined;
  const id = body?.id as string | undefined;
  if ((table !== 'events' && table !== 'resources') || !id) {
    return Response.json({ skipped: 'not an event or resource' });
  }

  // Claim the item exactly once, and only while it's published.
  const { data: item } = await db
    .from(table)
    .update({ notified_at: new Date().toISOString() })
    .eq('id', id)
    .eq('published', true)
    .is('notified_at', null)
    .select('*')
    .maybeSingle();
  if (!item) return Response.json({ skipped: 'already notified or not published' });

  const prefColumn = table === 'events' ? 'notify_events' : 'notify_resources';
  const { data: recipients } = await db.from('profiles').select('id').eq(prefColumn, true);
  const ids = (recipients ?? []).map((r) => r.id);
  if (!ids.length) return Response.json({ sent: 0 });

  const { data: tokens } = await db.from('expo_push_tokens').select('token').in('user_id', ids);
  const list = (tokens ?? []).map((t) => t.token as string);
  if (!list.length) return Response.json({ sent: 0 });

  const slug = (item.slug as string | null) ?? (item.id as string);
  const message =
    table === 'events'
      ? {
          title: 'New event',
          body: `${item.title} · ${formatDay(item.event_date as string)}`,
          data: { url: `/events/${slug}` },
        }
      : {
          title: 'New in Resources',
          body: item.title as string,
          data: { url: `/resources/${slug}` },
        };

  const dead: string[] = [];
  let sent = 0;
  // Expo accepts up to 100 messages per request.
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(chunk.map((to) => ({ to, sound: 'default', ...message }))),
    });
    const json = await res.json().catch(() => ({}));
    const tickets: { status: string; details?: { error?: string } }[] = json?.data ?? [];
    tickets.forEach((t, j) => {
      if (t.status === 'ok') sent++;
      else if (t.details?.error === 'DeviceNotRegistered') dead.push(chunk[j]);
    });
  }

  if (dead.length) await db.from('expo_push_tokens').delete().in('token', dead);
  return Response.json({ sent, pruned: dead.length });
});

/** "Fri, Dec 4" from "2026-12-04". */
function formatDay(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
