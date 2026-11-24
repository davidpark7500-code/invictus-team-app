import { Image } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Glass } from '@/components/glass/Glass';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

import { initialsOf, type RankedRow } from './rank';

/** "TOTAL" is wider than "MEM" and "ORD"; on iPhone it wrapped to "TOTA L". */
const TOTAL_EXTRA = 12;

function statWidth(screen: number) {
  if (screen < 360) return 36;
  if (screen < 400) return 40;
  return 44;
}

function RankBadge({ rank }: { rank: number }) {
  const { colors } = useTheme();
  const palette = [
    { bg: colors.brand, fg: colors.onBrand },
    { bg: colors.rank2, fg: '#FFFFFF' },
    { bg: colors.rank3, fg: '#FFFFFF' },
  ];
  const tone = palette[rank - 1] ?? { bg: colors.badgeBg, fg: colors.text };
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg, borderColor: colors.background }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]}>{rank}</Text>
    </View>
  );
}

function Avatar({ row }: { row: RankedRow }) {
  const { colors } = useTheme();
  return (
    <View style={styles.avatarWrap}>
      {row.photoUrl ? (
        <Image source={{ uri: row.photoUrl }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.initials, { backgroundColor: colors.fillStrong }]}>
          <Text style={[styles.initialsText, { color: colors.textSecondary }]}>{initialsOf(row.fullName)}</Text>
        </View>
      )}
      {/* No badge for people with zero sales: a wall of identical badges reads as blobs. */}
      {row.total > 0 ? <RankBadge rank={row.rank} /> : null}
    </View>
  );
}

export function RankingCard({ rows, meId, title }: { rows: RankedRow[]; meId: string; title: string }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const w = statWidth(width);

  return (
    <Glass content radius={22} tintColor={colors.cardGlass} style={[styles.card, { borderColor: colors.border }]}>
      <View style={styles.header}>
        <Text variant="headline" style={styles.title}>
          {title}
        </Text>
        <Text style={[styles.col, { width: w, color: colors.brandText }]}>MEM</Text>
        <Text style={[styles.col, { width: w, color: colors.blueText }]}>ORD</Text>
        <Text numberOfLines={1} style={[styles.col, { width: w + TOTAL_EXTRA, color: colors.text }]}>
          TOTAL
        </Text>
      </View>
      {rows.map((row, i) => {
        const me = row.userId === meId;
        return (
          <View
            key={row.userId}
            style={[
              styles.row,
              i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
              me && { backgroundColor: colors.brandSoft },
            ]}>
            <Avatar row={row} />
            {/* Names wrap; never truncate. The tinted row marks "you". */}
            <Text style={styles.name} accessibilityLabel={me ? `${row.fullName}, you` : row.fullName}>
              {row.fullName}
            </Text>
            <Text style={[styles.stat, { width: w, color: row.memberships ? colors.brandText : colors.textTertiary }]}>
              {row.memberships}
            </Text>
            <Text style={[styles.stat, { width: w, color: row.orders ? colors.blueText : colors.textTertiary }]}>
              {row.orders}
            </Text>
            <Text style={[styles.stat, styles.total, { width: w + TOTAL_EXTRA, color: row.total ? colors.text : colors.textTertiary }]}>
              {row.total}
            </Text>
          </View>
        );
      })}
    </Glass>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', paddingBottom: Spacing.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { flex: 1 },
  col: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  avatarWrap: { width: 40, height: 40, marginRight: Spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 14, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '800', lineHeight: 13, fontVariant: ['tabular-nums'] },
  name: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 19, paddingRight: Spacing.xs },
  stat: { fontSize: 15, fontWeight: '700', textAlign: 'right', fontVariant: ['tabular-nums'] },
  total: { fontSize: 16, fontWeight: '800' },
});
