import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { Glass, type GlassProps } from '@/components/glass/Glass';
import { Pressable } from '@/components/ui/Pressable';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Props = GlassProps & {
  onPress?: () => void;
  padded?: boolean;
};

/**
 * Content card in the leaderboard's design: translucent glass (radius 22,
 * hairline border) over the app-wide glow. Android gets the same translucent
 * fill without live blur, since blurring every list cell costs frame rate.
 */
export function Card({ onPress, padded = true, style, children, tintColor, ...rest }: Props) {
  const { colors, reduceTransparency } = useTheme();
  const shell = [styles.shell, { borderColor: colors.border }, padded && styles.padded, style];
  const body =
    Platform.OS === 'android' && !reduceTransparency ? (
      <View style={[shell, { borderRadius: Radius.lg, backgroundColor: tintColor ?? colors.cardGlass }]} {...rest}>
        {children}
      </View>
    ) : (
      <Glass radius={Radius.lg} interactive={!!onPress} tintColor={tintColor ?? colors.cardGlass} style={shell} {...rest}>
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
  shell: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  padded: { padding: Spacing.lg },
  row: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
});
