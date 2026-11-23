// Supabase Edge Function: push a notification when someone logs a sale.
// Called by a database trigger on INSERT into public.sales (migration 0007), with the
// same { type, table, record } payload a Database Webhook would send.
//
// Rules ported from Pulse Board:
// - notify everyone who opted in to that kind of sale (profiles.notify_membership / notify_order)
// - never notify the seller
// - send at most once per sale (claims sales.notified_at atomically)
// - prune device tokens Expo reports as no longer registered
//
// The caller proves itself with the shared secret in "x-notify-secret", checked by
// public.notify_secret_ok() (service role only). SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// are provided by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2';

type SaleRecord = { id: string; user_id: string; kind: 'membership' | 'order'; created_at: string };

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });
  const { data: ok } = await db.rpc('notify_secret_ok', { secret: req.headers.get('x-notify-secret') ?? '' });
  if (ok !== true) return new Response('forbidden', { status: 403 });

  const body = await req.json().catch(() => null);
  const sale: SaleRecord | undefined = body?.record;
  if (body?.type !== 'INSERT' || body?.table !== 'sales' || !sale?.id) {
    return Response.json({ skipped: 'not a sales insert' });
  }
  // Skip back-filled rows (e.g. the one-time data copy): only fresh taps notify.
  if (Date.now() - new Date(sale.created_at).getTime() > 2 * 60 * 1000) {
    return Response.json({ skipped: 'not fresh' });
  }

  // Claim the sale exactly once, even if the webhook is retried.
  const { data: claimed } = await db
    .from('sales')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', sale.id)
    .is('notified_at', null)
    .select('id')
    .maybeSingle();
  if (!claimed) return Response.json({ skipped: 'already notified' });

  const prefColumn = sale.kind === 'membership' ? 'notify_membership' : 'notify_order';
  const [{ data: seller }, { data: recipients }] = await Promise.all([
    db.from('profiles').select('full_name').eq('id', sale.user_id).single(),
    db.from('profiles').select('id').eq(prefColumn, true).neq('id', sale.user_id),
  ]);
  const ids = (recipients ?? []).map((r) => r.id);
  if (!ids.length) return Response.json({ sent: 0 });

  const { data: tokens } = await db.from('expo_push_tokens').select('token').in('user_id', ids);
  const list = (tokens ?? []).map((t) => t.token as string);
  if (!list.length) return Response.json({ sent: 0 });

  const name = seller?.full_name ?? 'Someone';
  const what = sale.kind === 'membership' ? 'added a membership' : 'added a $150+ order';
  const dead: string[] = [];
  let sent = 0;

  // Expo accepts up to 100 messages per request.
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(
        chunk.map((to) => ({
          to,
          title: 'Pulse',
          body: `${name} ${what}`,
          sound: 'default',
          data: { url: '/leaderboard', kind: sale.kind },
        })),
      ),
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
