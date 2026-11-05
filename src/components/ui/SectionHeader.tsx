import { StyleSheet, View } from 'react-native';

import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/theme/tokens';

type Props = { title: string; action?: string; onAction?: () => void };

export function SectionHeader({ title, action, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text variant="title2">{title}</Text>
      {action ? (
        <Pressable onPress={onAction} haptic={false} hitSlop={8}>
          <Text variant="subheadline" color="accent">
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.sm,
  },
});
