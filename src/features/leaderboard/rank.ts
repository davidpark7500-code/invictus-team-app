/** Ported from Pulse Board (lib/rank.ts and lib/types.ts). */

export type SaleKind = 'membership' | 'order';

export type BoardRow = {
  userId: string;
  fullName: string;
  memberships: number;
  orders: number;
  total: number;
  /** 1 per membership, 2 per $150+ order. What the board ranks on. */
  points: number;
  photoUrl?: string | null;
};

/**
 * Scoring: every membership is 1 point, every $150+ order is 2 points. The database computes
 * the same thing in leaderboard() and leaderboard_all_time(); keep the two in step.
 */
export const MEMBERSHIP_POINTS = 1;
export const ORDER_POINTS = 2;
export const pointsOf = (memberships: number, orders: number) => memberships * MEMBERSHIP_POINTS + orders * ORDER_POINTS;

export type RankedRow = BoardRow & { rank: number };

/**
 * Most points first, then more memberships, then more orders, then name.
 * Tied people share a rank (1, 1, 3), where "tied" means the same points AND
 * the same memberships count.
 */
export function rankRows(rows: BoardRow[]): RankedRow[] {
  const sorted = [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.memberships - a.memberships ||
      b.orders - a.orders ||
      a.fullName.localeCompare(b.fullName),
  );
  return sorted.map((r) => ({
    ...r,
    rank:
      1 +
      sorted.filter((o) => o.points > r.points || (o.points === r.points && o.memberships > r.memberships)).length,
  }));
}

export function initialsOf(name: string): string {
  const parts = name
    .replace(/\(.*?\)/g, ' ')
    .replace(/&/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((p) => p && p.toLowerCase() !== 'and');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
