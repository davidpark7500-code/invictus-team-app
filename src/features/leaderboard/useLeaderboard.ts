import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { supabase } from '@/lib/supabase';

import { type BoardRow, type SaleKind } from './rank';

/** Ported from Pulse Board. A member can undo their own tap for this long. */
export const UNDO_WINDOW_MS = 15 * 60 * 1000;

export type FeedItem = { id: string; userId: string; kind: SaleKind; fullName: string; createdAt: string };

type RpcRow = {
  user_id: string;
  full_name: string;
  memberships: number;
  orders: number;
  total: number;
  points: number;
  photo_url: string | null;
};

const toRow = (r: RpcRow): BoardRow => ({
  userId: r.user_id,
  fullName: r.full_name,
  memberships: r.memberships,
  orders: r.orders,
  total: r.total,
  points: r.points,
  photoUrl: r.photo_url,
});

/** The device's own calendar day ("YYYY-MM-DD"), as Pulse Board sends it, so a late-evening sale lands on the right day. */
function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function friendly(message: string) {
  if (/network|fetch/i.test(message)) return 'No connection. Try again in a moment.';
  if (/row-level security|permission/i.test(message)) return 'That can’t be changed any more.';
  return message;
}

/**
 * The live board for one period, plus the recent-sales feed. Both reload when anyone's sale is
 * added or removed (Supabase Realtime on `sales`), when the tab comes back into view and when the
 * app returns to the foreground.
 */
export function useLeaderboard({ week, allTime, enabled }: { week: string; allTime: boolean; enabled: boolean }) {
  const [rows, setRows] = useState<BoardRow[] | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);

  const load = useCallback(async () => {
    if (!supabase || !enabled) return;
    const id = ++request.current;
    const [board, recent] = await Promise.all([
      allTime ? supabase.rpc('leaderboard_all_time') : supabase.rpc('leaderboard', { p_week: week }),
      supabase
        .from('sales')
        .select('id, user_id, kind, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(15),
    ]);
    if (id !== request.current) return; // A newer load already landed.
    if (board.error || recent.error) {
      setError(friendly((board.error ?? recent.error)!.message));
      return;
    }
    setError(null);
    setRows((board.data as RpcRow[]).map(toRow));
    setFeed(
      (recent.data ?? []).map((s) => {
        const profile = s.profiles as unknown as { full_name: string } | null;
        return {
          id: s.id as string,
          userId: s.user_id as string,
          kind: s.kind as SaleKind,
          fullName: profile?.full_name ?? 'Someone',
          createdAt: s.created_at as string,
        };
      }),
    );
  }, [allTime, week, enabled]);

  // Runs on first view, whenever the period changes and each time the tab comes back into view.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => state === 'active' && load());
    return () => sub.remove();
  }, [load]);

  useEffect(() => {
    if (!supabase || !enabled) return;
    const client = supabase;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // A burst of taps arrives as a burst of events; reload once after it settles.
    const reload = () => {
      clearTimeout(timer);
      timer = setTimeout(load, 250);
    };
    const channel = client
      .channel('leaderboard-sales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, reload)
      .subscribe();
    return () => {
      clearTimeout(timer);
      client.removeChannel(channel);
    };
  }, [load, enabled]);

  return { rows, feed, error, reload: load };
}

/** Logs one sale for the signed-in person. Returns an error message, or null. */
export async function logSale(kind: SaleKind): Promise<string | null> {
  if (!supabase) return 'Not connected.';
  const { error } = await supabase.from('sales').insert({ kind, sale_date: localDate() });
  return error ? friendly(error.message) : null;
}

/** Removes one sale (your own within 15 minutes; admins any). Returns an error message, or null. */
export async function undoSale(id: string): Promise<string | null> {
  if (!supabase) return 'Not connected.';
  const { error, count } = await supabase.from('sales').delete({ count: 'exact' }).eq('id', id);
  if (error) return friendly(error.message);
  return count === 0 ? 'That sale can’t be undone any more.' : null;
}

/** Lowers this week's count for one kind: the most recent taps come off first. */
export async function removeMySales(kind: SaleKind, count: number): Promise<string | null> {
  if (!supabase) return 'Not connected.';
  const { error } = await supabase.rpc('remove_my_sales', { p_kind: kind, p_count: count });
  return error ? friendly(error.message) : null;
}

/** "just now", "4m ago", "2h ago", "3d ago" */
export function timeAgo(iso: string, now = Date.now()) {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
