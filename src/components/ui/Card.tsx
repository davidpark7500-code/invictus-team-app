import { Platform, StyleSheet, type ViewProps } from 'react-native';

import { Glass, type GlassProps } from '@/components/glass/Glass';
import { Pressable } from '@/components/ui/Pressable';
import { Radius, Spacing } from '@/theme/tokens';

type Props = GlassProps & {
  onPress?: () => void;
  padded?: boolean;
};

/**
 * Content card. Glass on iOS/web, solid elevated surface on Android
 * (blurring every list cell on Android is a frame-rate tax, not a feature).
 */
export function Card({ onPress, padded = true, style, children, ...rest }: Props) {
  const body = (
    <Glass
      radius={Radius.lg}
      solid={Platform.OS === 'android'}
      interactive={!!onPress}
      style={[padded && styles.padded, style]}
      {...rest}>
      {children}
    </Glass>
  );
  if (!onPress) return body;
  return <Pressable onPress={onPress}>{body}</Pressable>;
}

export function Row({ style, ...rest }: ViewProps) {
  return <Glass solid={Platform.OS === 'android'} radius={Radius.md} style={[styles.row, style]} {...rest} />;
}

const styles = StyleSheet.create({
  padded: { padding: Spacing.lg },
  row: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
});
