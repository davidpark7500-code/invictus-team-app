import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { STAGE_LABELS, STAGES, type Stage } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Props = { checkpoints: Record<Stage, boolean>; labels?: boolean };

/** The five pipeline checkpoints as a row of stage markers. */
export function StageDots({ checkpoints, labels = false }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {STAGES.map((stage) => {
        const done = checkpoints[stage];
        const tone = colors.stage[stage];
        return (
          <View key={stage} style={styles.item}>
            <View
              style={[
                styles.dot,
                done ? { backgroundColor: tone } : { borderColor: colors.borderStrong, borderWidth: 1.5 },
              ]}
            />
            {labels ? (
              <Text variant="caption" color={done ? 'text' : 'textTertiary'}>
                {STAGE_LABELS[stage]}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function stageProgress(checkpoints: Record<Stage, boolean>) {
  return STAGES.filter((s) => checkpoints[s]).length;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  item: { alignItems: 'center', gap: Spacing.xs },
  dot: { width: 12, height: 12, borderRadius: Radius.pill },
});
