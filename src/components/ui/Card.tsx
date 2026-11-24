import { StyleSheet, type ViewProps } from 'react-native';

import { Glass, type GlassProps } from '@/components/glass/Glass';
import { Pressable } from '@/components/ui/Pressable';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Props = GlassProps & {
  onPress?: () => void;
  padded?: boolean;
};

/**
 * Content card in the leaderboard's design: a translucent pane (radius 22,
 * hairline border, lit top rim) over the app-wide glow. Not Liquid Glass:
 * see `content` in Glass.tsx.
 */
export function Card({ onPress, padded = true, style, children, tintColor, ...rest }: Props) {
  const { colors } = useTheme();
  const body = (
    <Glass
      content
      radius={Radius.lg}
      tintColor={tintColor ?? colors.cardGlass}
      style={[styles.shell, padded && styles.padded, style]}
      {...rest}>
      {children}
    </Glass>
  );
  if (!onPress) return body;
  return <Pressable onPress={onPress}>{body}</Pressable>;
}

export function Row({ style, ...rest }: ViewProps) {
  return <Card padded={false} style={[styles.row, style]} {...rest} />;
}

const styles = StyleSheet.create({
  shell: {},
  padded: { padding: Spacing.lg },
  row: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
});
