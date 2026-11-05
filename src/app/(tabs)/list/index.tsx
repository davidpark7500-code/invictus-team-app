import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Glass, GlassGroup } from '@/components/glass/Glass';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { formatRelativeDay } from '@/data/format';
import { customers, prospects } from '@/data/mock';
import { StageDots, stageProgress } from '@/features/list/StageDots';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Tab = 'prospects' | 'customers';

export default function ListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('prospects');
  const now = Date.now();

  const sortedProspects = [...prospects].sort((a, b) => stageProgress(b.checkpoints) - stageProgress(a.checkpoints));

  return (
    <Screen>
      <GlassGroup spacing={6} style={styles.segment}>
        {(['prospects', 'customers'] as Tab[]).map((t) => {
          const active = tab === t;
          const count = t === 'prospects' ? prospects.length : customers.length;
          return (
            <Pressable key={t} onPress={() => setTab(t)} style={styles.segmentItem}>
              <Glass interactive radius={Radius.pill} tintColor={active ? colors.accentSoft : undefined} style={styles.segmentInner}>
                <Text variant="headline" color={active ? 'accent' : 'textSecondary'}>
                  {t === 'prospects' ? 'Prospects' : 'Customers'} · {count}
                </Text>
              </Glass>
            </Pressable>
          );
        })}
      </GlassGroup>

      {tab === 'prospects'
        ? sortedProspects.map((p) => {
            const due = p.nextFollowUpAt && new Date(p.nextFollowUpAt).getTime() <= now;
            return (
              <Card key={p.id} onPress={() => router.push(`/list/prospect/${p.id}`)}>
                <View style={styles.head}>
                  <Text variant="headline">{p.name}</Text>
                  {p.nextFollowUpAt ? (
                    <Pill label={`Follow up ${formatRelativeDay(p.nextFollowUpAt).toLowerCase()}`} color={due ? colors.danger : undefined} filled={!!due} />
                  ) : null}
                </View>
                <Text variant="subheadline" color="textSecondary" numberOfLines={2}>
                  {p.notes}
                </Text>
                <View style={styles.foot}>
                  <StageDots checkpoints={p.checkpoints} />
                  <View style={styles.meta}>
                    <Icon name="pin" size={12} color={colors.textTertiary} />
                    <Text variant="caption" color="textTertiary">
                      {p.location} · {p.channel}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        : customers.map((c) => (
            <Card key={c.id} onPress={() => router.push(`/list/customer/${c.id}`)}>
              <View style={styles.head}>
                <Text variant="headline">{c.name}</Text>
                {!c.thankYouSent ? <Pill label="Thank-you due" color={colors.warning} /> : null}
              </View>
              <Text variant="subheadline" color="textSecondary">
                {c.productsOrdered.length ? c.productsOrdered.join(', ') : 'No orders yet'}
              </Text>
              <View style={styles.foot}>
                <Pill label={c.cnaCompleted ? 'CNA done' : 'CNA pending'} color={c.cnaCompleted ? colors.success : colors.textSecondary} />
                <Text variant="caption" color="textTertiary">
                  {c.nextSteps}
                </Text>
              </View>
            </Card>
          ))}

      <Pressable style={styles.fabWrap} onPress={() => {}}>
        <Glass interactive radius={Radius.pill} tintColor={colors.accent} style={styles.fab}>
          <Icon name="add" size={18} color={colors.onAccent} />
          <Text variant="headline" style={{ color: colors.onAccent }}>
            Add {tab === 'prospects' ? 'prospect' : 'customer'}
          </Text>
        </Glass>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: Spacing.sm },
  segmentItem: { flex: 1 },
  segmentInner: { alignItems: 'center', paddingVertical: Spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm, marginBottom: Spacing.xs },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md, gap: Spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexShrink: 1 },
  fabWrap: { alignSelf: 'center', marginTop: Spacing.sm },
  fab: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
});
