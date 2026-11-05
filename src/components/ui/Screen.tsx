import { Platform, ScrollView, type ScrollViewProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { MaxContentWidth, Spacing } from '@/theme/tokens';

type Props = ScrollViewProps & {
  /** Extra bottom room for the docked mini player. */
  playerInset?: boolean;
};

/**
 * Scrollable screen body. On iOS the native large-title header and the
 * tab bar manage insets, so content scrolls under glass automatically.
 */
export function Screen({ children, contentContainerStyle, playerInset = true, ...rest }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = (Platform.OS === 'ios' ? 0 : insets.bottom + 80) + (playerInset ? 72 : 0);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardDismissMode="on-drag"
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        Platform.OS === 'android' && { paddingTop: insets.top + Spacing.lg },
        Platform.OS === 'web' && { paddingTop: Spacing.xl },
        { paddingBottom: bottom + Spacing.xl },
        contentContainerStyle,
      ]}
      {...rest}>
      <View style={styles.column}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: Spacing.lg },
  column: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.lg },
});
