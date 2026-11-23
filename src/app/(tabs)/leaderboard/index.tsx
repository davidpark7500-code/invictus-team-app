import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, GlassGroup } from '@/components/glass/Glass';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { GlowBackground } from '@/features/leaderboard/GlowBackground';
import { currentWeek, formatWeekEnd, formatWeekRange, LAUNCH_WEEK, shiftWeek } from '@/features/leaderboard/period';
import { allTimeRows, ME_ID, placeholderFeed, weekRows } from '@/features/leaderboard/placeholder';
import { RankingCard } from '@/features/leaderboard/RankingCard';
import { initialsOf, rankRows, type SaleKind } from '@/features/leaderboard/rank';
import { SaleButton } from '@/features/leaderboard/SaleButton';
import { useTheme } from '@/theme/ThemeProvider';
import { MaxContentWidth, Radius, Spacing } from '@/theme/tokens';

type Period = 'week' | 'all';

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const thisWeek = currentWeek();
  const [period, setPeriod] = useState<Period>('week');
  const [week, setWeek] = useState(thisWeek);
  // Taps are local only until the backend exists.
  const [extra, setExtra] = useState<Record<SaleKind, number>>({ membership: 0, order: 0 });

  const rows = useMemo(() => {
    const base = period === 'week' ? weekRows(week) : allTimeRows();
    const counting = period === 'all' || week === thisWeek;
    return rankRows(
      base.map((r) =>
        r.userId === ME_ID && counting
          ? {
              ...r,
              memberships: r.memberships + extra.membership,
              orders: r.orders + extra.order,
              total: r.total + extra.membership + extra.order,
            }
          : r,
      ),
    );
  }, [period, week, thisWeek, extra]);

  const me = rows.find((r) => r.userId === ME_ID);
  const tap = (kind: SaleKind) => setExtra((e) => ({ ...e, [kind]: e[kind] + 1 }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <GlowBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 72 : 120) },
        ]}>
        <View style={styles.column}>
          <View style={styles.header}>
            <BrandLogo width={54} />
            <View style={styles.headerText}>
              <Text variant="title3">Pulse</Text>
              <Text variant="footnote" color="textSecondary">
                Membership Leaderboard
              </Text>
            </View>
            <Pressable accessibilityLabel="Alerts" hitSlop={8}>
              <Glass interactive radius={Radius.pill} style={styles.round}>
                <Icon name="bell" size={18} />
              </Glass>
            </Pressable>
            <Pressable accessibilityLabel="Account" hitSlop={8}>
              <View style={[styles.round, { backgroundColor: colors.fillStrong }]}>
                <Text style={styles.meInitials}>{initialsOf(me?.fullName ?? '')}</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.buttons}>
            <SaleButton kind="membership" count={me?.memberships ?? 0} onTap={() => tap('membership')} />
            <SaleButton kind="order" count={me?.orders ?? 0} onTap={() => tap('order')} />
          </View>

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

          <RankingCard rows={rows} meId={ME_ID} title="Ranking" />

          <Glass radius={22} tintColor={colors.cardGlass} style={[styles.feed, { borderColor: colors.border }]}>
            <Text variant="headline" style={styles.feedTitle}>
              Live activity
            </Text>
            {placeholderFeed.map((f) => (
              <View key={f.id} style={styles.feedRow}>
                <View style={[styles.dot, { backgroundColor: f.kind === 'membership' ? colors.brand : colors.blue }]} />
                <Text variant="subheadline" style={styles.feedText}>
                  <Text style={{ fontWeight: '600' }}>{f.fullName}</Text>
                  {f.kind === 'membership' ? ' added a membership' : ' added a $150+ order'}
                </Text>
                <Text variant="caption" color="textTertiary">
                  {f.minutesAgo < 60 ? `${f.minutesAgo}m ago` : `${Math.floor(f.minutesAgo / 60)}h ago`}
                </Text>
              </View>
            ))}
          </Glass>

          <Text variant="caption" color="textTertiary" style={styles.note}>
            Preview with placeholder numbers. Taps aren’t saved yet.
          </Text>
        </View>
      </ScrollView>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerText: { flex: 1 },
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
  note: { textAlign: 'center' },
});
