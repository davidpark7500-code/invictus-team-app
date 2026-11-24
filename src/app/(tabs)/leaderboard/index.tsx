import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, GlassGroup } from '@/components/glass/Glass';
import { Icon } from '@/components/ui/Icon';
import { TabHeader, useTabRootScroll } from '@/components/ui/TabHeader';
import { Text } from '@/components/ui/Text';
import { currentWeek, formatWeekEnd, formatWeekRange, LAUNCH_WEEK, shiftWeek } from '@/features/leaderboard/period';
import { FixCountSheet } from '@/features/leaderboard/FixCountSheet';
import { allTimeRows, ME_ID, placeholderFeed, weekRows } from '@/features/leaderboard/placeholder';
import { useScreenGlowStyle } from '@/features/leaderboard/GlowBackground';
import { RankingCard } from '@/features/leaderboard/RankingCard';
import { pointsOf, rankRows, type SaleKind } from '@/features/leaderboard/rank';
import { SaleButton } from '@/features/leaderboard/SaleButton';
import { logSale, timeAgo, UNDO_WINDOW_MS, undoSale, useLeaderboard, type FeedItem } from '@/features/leaderboard/useLeaderboard';
import { useAuth } from '@/lib/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { MaxContentWidth, Radius, Spacing } from '@/theme/tokens';

type Period = 'week' | 'all';

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabTop = useTabRootScroll();
  const thisWeek = currentWeek();
  const [period, setPeriod] = useState<Period>('week');
  const [week, setWeek] = useState(thisWeek);
  const { session, demoMode } = useAuth();
  const live = !demoMode && !!session;
  const meId = live ? session.user.id : ME_ID;
  const board = useLeaderboard({ week, allTime: period === 'all', enabled: live });
  // Taps show at once. They belong to the board they were made on: once fresh numbers arrive
  // (which include them), they no longer count.
  const [pending, setPending] = useState({ base: board.rows, membership: 0, order: 0 });
  const extra = pending.base === board.rows ? pending : { membership: 0, order: 0 };
  const bump = (kind: SaleKind, by: number) =>
    setPending((p) => {
      const cur = p.base === board.rows ? p : { base: board.rows, membership: 0, order: 0 };
      return { ...cur, [kind]: Math.max(0, cur[kind] + by) };
    });
  const [notice, setNotice] = useState<string | null>(null);
  const [fixing, setFixing] = useState(false);
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => Date.now());

  // Keeps "2m ago" and the Undo buttons current.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const counting = period === 'all' || week === thisWeek;
  const rows = useMemo(() => {
    const base = live ? (board.rows ?? []) : period === 'week' ? weekRows(week) : allTimeRows();
    return rankRows(
      base.map((r) =>
        r.userId === meId && counting
          ? {
              ...r,
              memberships: r.memberships + extra.membership,
              orders: r.orders + extra.order,
              total: r.total + extra.membership + extra.order,
              points: r.points + pointsOf(extra.membership, extra.order),
            }
          : r,
      ),
    );
  }, [live, board.rows, period, week, meId, counting, extra.membership, extra.order]);

  const glow = useScreenGlowStyle();
  const me = rows.find((r) => r.userId === meId);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.fullName.toLowerCase().includes(q)) : rows;
  }, [rows, query]);
  const feed: FeedItem[] = live
    ? board.feed
    : placeholderFeed.map((f) => ({
        id: f.id,
        userId: f.id,
        kind: f.kind,
        fullName: f.fullName,
        createdAt: new Date(now - f.minutesAgo * 60000).toISOString(),
      }));

  async function tap(kind: SaleKind) {
    setNotice(null);
    // Logging always counts toward this week, so bring the view there if it's on a past week.
    if (period === 'week' && week !== thisWeek) setWeek(thisWeek);
    bump(kind, 1);
    if (!live) return;
    const failed = await logSale(kind);
    if (failed) {
      bump(kind, -1);
      setNotice(`That sale wasn’t saved. ${failed}`);
    }
  }

  async function undo(id: string) {
    setNotice(null);
    const failed = await undoSale(id);
    if (failed) setNotice(failed);
    else board.reload();
  }

  return (
    <View style={styles.root}>
      <ScrollView
        style={[styles.scroll, glow]}
        contentInsetAdjustmentBehavior={tabTop.contentInsetAdjustmentBehavior}
        contentContainerStyle={[
          styles.content,
          { paddingTop: tabTop.paddingTop, paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 72 : 120) },
        ]}>
        <View style={styles.column}>
          <TabHeader title="Pulse" subtitle="Membership Leaderboard" />

          <View style={styles.buttons}>
            <SaleButton kind="membership" count={me?.memberships ?? 0} onTap={() => tap('membership')} />
            <SaleButton kind="order" count={me?.orders ?? 0} onTap={() => tap('order')} />
          </View>

          {notice || board.error ? (
            <Text variant="footnote" style={[styles.center, { color: colors.danger }]}>
              {notice ?? board.error}
            </Text>
          ) : null}

          {live && period === 'week' && week === thisWeek && me && me.total > 0 ? (
            <Pressable onPress={() => setFixing(true)} accessibilityRole="button" style={styles.fixLink} hitSlop={6}>
              <Icon name="tune" size={15} color={colors.textSecondary} />
              <Text variant="footnote" color="textSecondary" style={{ fontWeight: '600' }}>
                Tapped too many? Fix this week’s count
              </Text>
            </Pressable>
          ) : null}

          <GlassGroup spacing={4} style={[styles.segment, { backgroundColor: colors.fill }]}>
            {(['week', 'all'] as Period[]).map((p) => {
              const on = period === p;
              return (
                <Pressable key={p} style={styles.segmentItem} onPress={() => setPeriod(p)} accessibilityState={{ selected: on }}>
                  <View style={[styles.segmentInner, on && { backgroundColor: colors.backgroundElevated }]}>
                    <Text variant="subheadline" style={{ fontWeight: '600' }} color={on ? 'text' : 'textSecondary'}>
                      {p === 'week' ? 'This week' : 'All time'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </GlassGroup>

          {period === 'week' ? (
            <View style={styles.weekNav}>
              <WeekArrow dir="prev" disabled={week <= LAUNCH_WEEK} onPress={() => setWeek(shiftWeek(week, -1))} />
              <View style={styles.weekLabel}>
                <Text variant="headline">{formatWeekRange(week)}</Text>
                <Text variant="caption" color="textSecondary">
                  {week === thisWeek ? `This week · closes ${formatWeekEnd(week)}` : `Closed ${formatWeekEnd(week)}`}
                </Text>
              </View>
              <WeekArrow dir="next" disabled={week >= thisWeek} onPress={() => setWeek(shiftWeek(week, 1))} />
            </View>
          ) : null}

          <Text variant="caption" color="textSecondary" style={styles.center}>
            <Text variant="caption" style={{ fontWeight: '700', color: colors.brandText }}>1 point</Text> per membership ·{' '}
            <Text variant="caption" style={{ fontWeight: '700', color: colors.blueText }}>2 points</Text> per $150+ order
          </Text>

          {rows.length > 12 ? (
            <View style={[styles.search, { backgroundColor: colors.fill }]}>
              <Icon name="search" size={16} color={colors.textTertiary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Find a name"
                placeholderTextColor={colors.textTertiary}
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
          ) : null}

          {live && board.rows === null && !board.error ? (
            <Text variant="subheadline" color="textSecondary" style={styles.center}>
              Loading the board…
            </Text>
          ) : (
            <RankingCard rows={shown} meId={meId} title="Ranking" />
          )}

          <Glass content radius={22} tintColor={colors.cardGlass} style={[styles.feed, { borderColor: colors.border }]}>
            <Text variant="headline" style={styles.feedTitle}>
              Live activity
            </Text>
            {feed.length === 0 ? (
              <Text variant="subheadline" color="textSecondary">
                No sales yet. The first one shows up here.
              </Text>
            ) : null}
            {feed.map((f) => {
              const canUndo = live && f.userId === meId && now - new Date(f.createdAt).getTime() < UNDO_WINDOW_MS;
              return (
                <View key={f.id} style={styles.feedRow}>
                  <View style={[styles.dot, { backgroundColor: f.kind === 'membership' ? colors.brand : colors.blue }]} />
                  <Text variant="subheadline" style={styles.feedText}>
                    <Text style={{ fontWeight: '600' }}>{f.userId === meId ? 'You' : f.fullName}</Text>
                    {f.kind === 'membership' ? ' added a membership' : ' added a $150+ order'}
                  </Text>
                  {canUndo ? (
                    <Pressable onPress={() => undo(f.id)} accessibilityRole="button" accessibilityLabel="Undo this sale" hitSlop={8} style={styles.undo}>
                      <Icon name="undo" size={13} color={colors.textSecondary} />
                      <Text variant="caption" color="textSecondary" style={{ fontWeight: '600' }}>
                        Undo
                      </Text>
                    </Pressable>
                  ) : (
                    <Text variant="caption" color="textTertiary">
                      {timeAgo(f.createdAt, now)}
                    </Text>
                  )}
                </View>
              );
            })}
          </Glass>

          {!live ? (
            <Text variant="caption" color="textTertiary" style={styles.center}>
              Demo with sample numbers. Taps aren’t saved.
            </Text>
          ) : null}
        </View>
      </ScrollView>
      <FixCountSheet
        open={fixing}
        onClose={() => setFixing(false)}
        current={{ memberships: me?.memberships ?? 0, orders: me?.orders ?? 0 }}
      />
    </View>
  );
}

function WeekArrow({ dir, disabled, onPress }: { dir: 'prev' | 'next'; disabled: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={dir === 'prev' ? 'Previous week' : 'Next week'}
      hitSlop={8}
      style={disabled && styles.disabled}>
      <Glass interactive radius={Radius.pill} style={styles.round}>
        <Icon name={dir === 'prev' ? 'chevronLeft' : 'chevron'} size={16} color={colors.text} />
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { alignItems: 'center', paddingHorizontal: Spacing.lg },
  column: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.lg },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  meInitials: { fontSize: 14, fontWeight: '700' },
  buttons: { flexDirection: 'row', gap: Spacing.md },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 999, gap: 4 },
  segmentItem: { flex: 1 },
  segmentInner: { alignItems: 'center', paddingVertical: 9, borderRadius: 999 },
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  weekLabel: { flex: 1, alignItems: 'center', gap: 2 },
  disabled: { opacity: 0.35 },
  feed: { borderWidth: StyleSheet.hairlineWidth, padding: Spacing.lg, gap: Spacing.md },
  feedTitle: { marginBottom: 2 },
  feedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  feedText: { flex: 1 },
  center: { textAlign: 'center' },
  fixLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: -Spacing.xs },
  search: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.input, paddingHorizontal: Spacing.md, height: 42 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  undo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
