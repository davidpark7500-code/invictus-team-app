import { StyleSheet, View, type ViewProps } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Props = ViewProps & {
  label: string;
  color?: string;
  /** Filled = solid color with white text. Soft = tinted fill with colored text. */
  filled?: boolean;
};

export function Pill({ label, color, filled = false, style, ...rest }: Props) {
  const { colors } = useTheme();
  const tone = color ?? colors.accent;
  return (
    <View
      {...rest}
      style={[
        styles.pill,
        filled ? { backgroundColor: tone } : { backgroundColor: colors.fill },
        style,
      ]}>
      <Text variant="caption" style={{ color: filled ? colors.onAccent : tone }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
});
