/**
 * PLACEHOLDER data for building the Leaderboard UI. Every name, count and feed
 * item is invented. The leaderboard ranks EVERY team member (anyone with an
 * account), not the leaders on the Profiles tab, so it deliberately doesn't
 * use that list. Replace with the Supabase RPCs (leaderboard(),
 * leaderboard_all_time(), sales feed) once the project exists.
 */
import { trackedWeeks } from './period';
import { pointsOf, type BoardRow, type SaleKind } from './rank';

export const ME_ID = 'me';

const SAMPLE_NAMES = [
  'Alex & Jordan Rivera', 'Sam Patel', 'Taylor & Morgan Lee', 'Chris Bennett', 'Jamie & Riley Brooks',
  'Casey Nguyen', 'Drew & Avery Collins', 'Pat Morales', 'Robin & Quinn Hayes', 'Jesse Carter',
  'Skyler & Dana Price', 'Logan Reed', 'Cameron & Blake Ford', 'Rowan Ellis', 'Parker & Sage Diaz',
  'Emerson Gray', 'Hayden & Reese Kim', 'Kendall Shaw', 'Finley & Marley Cruz', 'Devon Walsh',
];

/** Couples sign up as one account ("Alex & Jordan Rivera"). */
const people = [
  { userId: ME_ID, fullName: 'You (sample)' },
  ...SAMPLE_NAMES.map((fullName, i) => ({ userId: `sample-${i}`, fullName })),
];

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
    return { userId, fullName, memberships, orders, total: memberships + orders, points: pointsOf(memberships, orders) };
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
        t.points += row.points;
      }
    }
  }
  return [...totals.values()];
}

export type FeedItem = { id: string; kind: SaleKind; fullName: string; minutesAgo: number };

export const placeholderFeed: FeedItem[] = [
  { id: 'f1', kind: 'membership', fullName: 'Alex & Jordan Rivera', minutesAgo: 2 },
  { id: 'f2', kind: 'order', fullName: 'Sam Patel', minutesAgo: 9 },
  { id: 'f3', kind: 'membership', fullName: 'Casey Nguyen', minutesAgo: 24 },
  { id: 'f4', kind: 'membership', fullName: 'Robin & Quinn Hayes', minutesAgo: 51 },
  { id: 'f5', kind: 'order', fullName: 'Logan Reed', minutesAgo: 95 },
];
