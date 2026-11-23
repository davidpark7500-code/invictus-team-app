/**
 * PLACEHOLDER data for building the Leaderboard UI. Names come from the team's
 * profiles; every count, date and feed item is invented. Replace with the
 * Supabase RPCs (leaderboard(), leaderboard_all_time(), sales feed) later.
 */
import { profiles } from '@/data/mock';

import { trackedWeeks } from './period';
import type { BoardRow, SaleKind } from './rank';

export const ME_ID = 'park';

/** Couples sign up as one account: "David & Samantha Park". */
const people = profiles.map((p) => ({
  userId: p.id,
  fullName: `${p.firstNames.replace(' and ', ' & ')} ${p.lastName}`,
}));

/** Small deterministic generator so each week looks different but stable. */
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function weekRows(week: string): BoardRow[] {
  return people.map(({ userId, fullName }) => {
    const r = seeded(`${week}:${userId}`);
    // About a third of people have no sales in a given week, to show hidden badges.
    const active = r() > 0.32;
    const memberships = active ? Math.floor(r() * 7) : 0;
    const orders = active ? Math.floor(r() * 4) : 0;
    return { userId, fullName, memberships, orders, total: memberships + orders };
  });
}

export function allTimeRows(): BoardRow[] {
  const totals = new Map<string, BoardRow>();
  for (const w of trackedWeeks()) {
    for (const row of weekRows(w)) {
      const t = totals.get(row.userId);
      if (!t) totals.set(row.userId, { ...row });
      else {
        t.memberships += row.memberships;
        t.orders += row.orders;
        t.total += row.total;
      }
    }
  }
  return [...totals.values()];
}

export type FeedItem = { id: string; kind: SaleKind; fullName: string; minutesAgo: number };

export const placeholderFeed: FeedItem[] = [
  { id: 'f1', kind: 'membership', fullName: 'Kyle & Austin Brown', minutesAgo: 2 },
  { id: 'f2', kind: 'order', fullName: 'Chad & Chelsea McCann', minutesAgo: 9 },
  { id: 'f3', kind: 'membership', fullName: 'Vy Nguyen', minutesAgo: 24 },
  { id: 'f4', kind: 'membership', fullName: 'Justin & Jordann Greene', minutesAgo: 51 },
  { id: 'f5', kind: 'order', fullName: 'Ethan & Abreale Quinn', minutesAgo: 95 },
];
