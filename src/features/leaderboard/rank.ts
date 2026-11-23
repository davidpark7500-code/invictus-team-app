/** Ported from Pulse Board (lib/rank.ts and lib/types.ts). */

export type SaleKind = 'membership' | 'order';

export type BoardRow = {
  userId: string;
  fullName: string;
  memberships: number;
  orders: number;
  total: number;
  photoUrl?: string | null;
};

export type RankedRow = BoardRow & { rank: number };

/**
 * Most total sales first, then more memberships, then more orders, then name.
 * Tied people share a rank (1, 1, 3), where "tied" means the same total AND
 * the same memberships count.
 */
export function rankRows(rows: BoardRow[]): RankedRow[] {
  const sorted = [...rows].sort(
    (a, b) =>
      b.total - a.total ||
      b.memberships - a.memberships ||
      b.orders - a.orders ||
      a.fullName.localeCompare(b.fullName),
  );
  return sorted.map((r) => ({
    ...r,
    rank:
      1 +
      sorted.filter((o) => o.total > r.total || (o.total === r.total && o.memberships > r.memberships)).length,
  }));
}

export function initialsOf(name: string): string {
  const parts = name
    .replace(/&/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((p) => p && p.toLowerCase() !== 'and');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
