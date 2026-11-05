import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { formatDate, formatRelativeDay } from '@/data/format';
import { prospects } from '@/data/mock';
import { STAGE_LABELS, STAGES, type Stage } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

export default function ProspectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const prospect = prospects.find((p) => p.id === id);
  const { colors } = useTheme();
  const [checkpoints, setCheckpoints] = useState<Record<Stage, boolean>>(
    prospect?.checkpoints ?? { tms: false, dtm: false, mg1: false, mg2: false, ge: false },
  );

  if (!prospect) {
    return (
      <Screen>
        <Text color="textSecondary">Prospect not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Text variant="title1">{prospect.name}</Text>
      <Text variant="subheadline" color="textSecondary">
        {prospect.location} · reached via {prospect.channel}
      </Text>

      <Card>
        <Text variant="footnote" color="textSecondary" style={styles.label}>
          PROCESS
        </Text>
        {STAGES.map((stage, i) => {
          const done = checkpoints[stage];
          const tone = colors.stage[stage];
          return (
            <Pressable
              key={stage}
              haptic
              onPress={() => setCheckpoints((c) => ({ ...c, [stage]: !c[stage] }))}
              style={[styles.stageRow, i < STAGES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
              <View style={[styles.check, done ? { backgroundColor: tone } : { borderColor: colors.borderStrong, borderWidth: 1.5 }]}>
                {done ? <Icon name="check" size={14} color={colors.onAccent} weight="bold" /> : null}
              </View>
              <Text variant="body" style={styles.stageText}>
                {STAGE_LABELS[stage]}
              </Text>
              <Text variant="caption" color="textTertiary">
                {done ? 'Done' : 'Not yet'}
              </Text>
            </Pressable>
          );
        })}
      </Card>

      <Card>
        <Text variant="footnote" color="textSecondary" style={styles.label}>
          NOTES
        </Text>
        <Text variant="body">{prospect.notes}</Text>
      </Card>

      <Card>
        <Row label="Last contacted" value={prospect.lastContactedAt ? formatDate(prospect.lastContactedAt) : '—'} />
        <Row label="Next follow-up" value={prospect.nextFollowUpAt ? formatRelativeDay(prospect.nextFollowUpAt) : 'None set'} />
      </Card>

      <View style={styles.actions}>
        <Button label="Log contact" icon="phone" />
        <Button label="Set follow-up" icon="clock" variant="glass" />
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kv}>
      <Text variant="subheadline" color="textSecondary">
        {label}
      </Text>
      <Text variant="subheadline">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  label: { letterSpacing: 0.6, marginBottom: Spacing.sm },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  check: { width: 26, height: 26, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  stageText: { flex: 1 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  actions: { gap: Spacing.sm },
});
