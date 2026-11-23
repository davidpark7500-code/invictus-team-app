#!/usr/bin/env node
/**
 * One-time copy of Pulse Board's leaderboard data into the combined app's NEW
 * Supabase project. Safe to re-run: it skips people and sales already copied.
 *
 * The OLD (live Pulse Board) project is only ever READ. Every write goes to NEW.
 * Run on your Mac only. Service-role keys bypass all security: never commit them,
 * never put them in the app.
 *
 *   OLD_SUPABASE_URL=https://popwjvdtkznhaudsogso.supabase.co \
 *   OLD_SERVICE_ROLE_KEY=... \
 *   NEW_SUPABASE_URL=https://<new-ref>.supabase.co \
 *   NEW_SERVICE_ROLE_KEY=... \
 *   node scripts/copy-pulse-data.mjs              # dry run: counts only, writes nothing
 *   node scripts/copy-pulse-data.mjs --apply      # copy people, photos and sales, then verify
 *   node scripts/copy-pulse-data.mjs --verify     # compare per-person, per-week totals only
 *   node scripts/copy-pulse-data.mjs --send-resets --redirect-to=invictus://reset   # at cutover
 *
 * Run --apply again at cutover for the final delta (new sales since the last run).
 */
import { createClient } from '@supabase/supabase-js';

const args = new Set(process.argv.slice(2).filter((a) => !a.includes('=')));
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.includes('=')).map((a) => a.replace(/^--/, '').split('=')));
const APPLY = args.has('--apply');
const VERIFY_ONLY = args.has('--verify');
const SEND_RESETS = args.has('--send-resets');
const LIVE_REF = 'popwjvdtkznhaudsogso';

const env = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing ${k}. See the comment at the top of this file.`);
  return v;
};
const OLD_URL = env('OLD_SUPABASE_URL');
const NEW_URL = env('NEW_SUPABASE_URL');
if (NEW_URL.includes(LIVE_REF)) throw new Error('NEW_SUPABASE_URL points at the live Pulse Board project. Refusing to write to it.');
if (OLD_URL === NEW_URL) throw new Error('OLD and NEW are the same project.');

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const oldDb = createClient(OLD_URL, env('OLD_SERVICE_ROLE_KEY'), opts); // READ ONLY: never call insert/update/delete/upload on this
const newDb = createClient(NEW_URL, env('NEW_SERVICE_ROLE_KEY'), opts);

const log = (...a) => console.log(...a);
const fail = (what, error) => {
  if (error) throw new Error(`${what}: ${error.message ?? error}`);
};

async function allUsers(db) {
  const out = [];
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    fail('list users', error);
    out.push(...data.users);
    if (data.users.length < 1000) return out;
  }
}

async function allRows(db, table, columns) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table).select(columns).order('id').range(from, from + 999);
    fail(`read ${table}`, error);
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

/** Wednesday on or before a YYYY-MM-DD date (same as week_start() in the database). */
function weekStart(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 4) % 7));
  return dt.toISOString().slice(0, 10);
}

/** email -> week -> "memberships/orders" for every sale in a project. */
async function totalsByEmailAndWeek(db) {
  const users = await allUsers(db);
  const emailOf = new Map(users.map((u) => [u.id, (u.email ?? '').toLowerCase()]));
  const sales = await allRows(db, 'sales', 'id, user_id, kind, sale_date');
  const t = new Map();
  for (const s of sales) {
    const key = `${emailOf.get(s.user_id)}|${weekStart(s.sale_date)}`;
    const v = t.get(key) ?? { m: 0, o: 0 };
    if (s.kind === 'membership') v.m++;
    else v.o++;
    t.set(key, v);
  }
  return t;
}

async function verify() {
  log('\nVerifying per-person, per-week totals…');
  const [a, b] = await Promise.all([totalsByEmailAndWeek(oldDb), totalsByEmailAndWeek(newDb)]);
  const keys = new Set([...a.keys(), ...b.keys()]);
  const bad = [];
  for (const k of keys) {
    const x = a.get(k) ?? { m: 0, o: 0 };
    const y = b.get(k) ?? { m: 0, o: 0 };
    if (x.m !== y.m || x.o !== y.o) bad.push(`${k}: old ${x.m}/${x.o}, new ${y.m}/${y.o}`);
  }
  if (bad.length) {
    log(`MISMATCH in ${bad.length} person-weeks:`);
    bad.slice(0, 50).forEach((l) => log('  ' + l));
    process.exitCode = 1;
  } else {
    log(`All ${keys.size} person-weeks match.`);
  }
}

async function main() {
  if (VERIFY_ONLY) return verify();

  if (SEND_RESETS) {
    const users = await allUsers(newDb);
    const redirectTo = opt['redirect-to'];
    log(`Sending password-reset emails to ${users.length} people${APPLY ? '' : ' (dry run: add --apply to send)'}…`);
    if (!APPLY) return;
    for (const u of users) {
      if (!u.email) continue;
      const { error } = await newDb.auth.resetPasswordForEmail(u.email, redirectTo ? { redirectTo } : undefined);
      log(`  ${u.email}: ${error ? 'FAILED ' + error.message : 'sent'}`);
    }
    return;
  }

  log(`${APPLY ? 'APPLY' : 'DRY RUN (nothing is written; add --apply)'}\n  old (read only): ${OLD_URL}\n  new:             ${NEW_URL}\n`);

  // 1. People
  const [oldUsers, newUsers, oldProfiles] = await Promise.all([
    allUsers(oldDb),
    allUsers(newDb),
    allRows(oldDb, 'profiles', 'id, full_name, role, notify_membership, notify_order, welcomed_at, photo_url, created_at'),
  ]);
  const profileOf = new Map(oldProfiles.map((p) => [p.id, p]));
  const newByEmail = new Map(newUsers.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u.id]));
  const idMap = new Map(); // old user id -> new user id
  let created = 0;
  let existing = 0;

  for (const u of oldUsers) {
    if (!u.email) continue;
    const email = u.email.toLowerCase();
    const p = profileOf.get(u.id);
    let newId = newByEmail.get(email);
    if (newId) existing++;
    else if (APPLY) {
      const { data, error } = await newDb.auth.admin.createUser({
        email,
        email_confirm: true,
        app_metadata: { invited: true }, // lets the team-code check skip copied accounts
        user_metadata: { full_name: p?.full_name ?? email.split('@')[0] },
      });
      fail(`create ${email}`, error);
      newId = data.user.id;
      created++;
    } else created++;
    if (newId) idMap.set(u.id, newId);
  }
  log(`People: ${oldUsers.length} in Pulse Board, ${existing} already copied, ${created} ${APPLY ? 'created' : 'to create'}.`);

  // 2. Profile details and photos
  let photos = 0;
  for (const [oldId, newId] of idMap) {
    const p = profileOf.get(oldId);
    if (!p) continue;
    let photoUrl = null;
    if (p.photo_url) {
      const path = decodeURIComponent(p.photo_url.split('/object/public/avatars/')[1]?.split('?')[0] ?? '');
      if (path) {
        photos++;
        if (APPLY) {
          const { data: blob, error } = await oldDb.storage.from('avatars').download(path);
          if (error) log(`  photo for ${p.full_name} skipped: ${error.message}`);
          else {
            const dest = `${newId}/${path.split('/').pop()}`;
            const up = await newDb.storage.from('avatars').upload(dest, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
            fail(`upload photo for ${p.full_name}`, up.error);
            photoUrl = newDb.storage.from('avatars').getPublicUrl(dest).data.publicUrl;
          }
        }
      }
    }
    if (APPLY) {
      const patch = {
        full_name: p.full_name,
        notify_membership: p.notify_membership,
        notify_order: p.notify_order,
        welcomed_at: p.welcomed_at,
        role: p.role === 'admin' ? 'admin' : 'member',
        ...(photoUrl ? { photo_url: photoUrl } : {}),
      };
      const { error } = await newDb.from('profiles').update(patch).eq('id', newId);
      fail(`update profile ${p.full_name}`, error);
    }
  }
  log(`Profiles: ${idMap.size} ${APPLY ? 'updated' : 'to update'}, ${photos} photos ${APPLY ? 'copied' : 'to copy'}. Admins carried over: ${oldProfiles.filter((p) => p.role === 'admin').map((p) => p.full_name).join(', ') || 'none'}.`);

  // 3. Sales (legacy_id = old sale id, so re-runs skip what's already there)
  const [oldSales, copied] = await Promise.all([
    allRows(oldDb, 'sales', 'id, user_id, kind, sale_date, created_at, notified_at'),
    allRows(newDb, 'sales', 'id, legacy_id'),
  ]);
  const done = new Set(copied.map((s) => s.legacy_id).filter(Boolean));
  const todo = oldSales.filter((s) => !done.has(s.id));
  const orphans = todo.filter((s) => !idMap.has(s.user_id) && APPLY);
  log(`Sales: ${oldSales.length} in Pulse Board, ${done.size} already copied, ${todo.length} ${APPLY ? 'to copy now' : 'to copy'}.`);
  if (orphans.length) log(`  ${orphans.length} sales belong to people with no email and are skipped.`);

  if (APPLY) {
    const rows = todo
      .filter((s) => idMap.has(s.user_id))
      .map((s) => ({
        legacy_id: s.id,
        user_id: idMap.get(s.user_id),
        kind: s.kind,
        sale_date: s.sale_date,
        created_at: s.created_at,
        notified_at: s.notified_at ?? s.created_at, // never re-notify old sales
      }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await newDb.from('sales').upsert(rows.slice(i, i + 500), { onConflict: 'legacy_id', ignoreDuplicates: true });
      fail('copy sales', error);
    }
    log(`  copied ${rows.length}.`);
    await verify();
  }
}

main().catch((e) => {
  console.error('\nStopped:', e.message);
  process.exitCode = 1;
});
