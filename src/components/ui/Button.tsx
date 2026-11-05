import { StyleSheet, View } from 'react-native';

import { Glass } from '@/components/glass/Glass';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Props = {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  variant?: 'primary' | 'glass' | 'quiet';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, icon, onPress, variant = 'primary', disabled, loading }: Props) {
  const { colors } = useTheme();
  const inactive = disabled || loading;
  const content = (
    <View style={styles.inner}>
      {icon ? (
        <Icon name={icon} size={16} color={variant === 'primary' ? colors.onAccent : colors.text} />
      ) : null}
      <Text variant="headline" style={{ color: variant === 'primary' ? colors.onAccent : colors.text }}>
        {loading ? 'Please wait…' : label}
      </Text>
    </View>
  );

  if (variant === 'glass') {
    return (
      <Pressable onPress={onPress} disabled={inactive} style={inactive && styles.disabled}>
        <Glass interactive radius={Radius.pill} style={styles.base}>
          {content}
        </Glass>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={[
        styles.base,
        variant === 'primary' ? { backgroundColor: colors.accent } : { backgroundColor: colors.fill },
        inactive && styles.disabled,
      ]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  disabled: { opacity: 0.5 },
});
