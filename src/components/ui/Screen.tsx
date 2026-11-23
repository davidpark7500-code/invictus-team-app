import { Platform, ScrollView, type ScrollViewProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_HEADER_TOP } from '@/components/ui/TabHeader';
import { MaxContentWidth, Spacing } from '@/theme/tokens';

type Props = ScrollViewProps & {
  /** Extra bottom room for the docked mini player. */
  playerInset?: boolean;
  /**
   * First screen of a tab, with no stack header above it. Pads the top exactly
   * like Leaderboard, so the logo row lands in the same spot on every tab.
   */
  tabRoot?: boolean;
};

/**
 * Scrollable screen body. On iOS the native large-title header and the
 * tab bar manage insets, so content scrolls under glass automatically.
 */
export function Screen({ children, contentContainerStyle, playerInset = true, tabRoot = false, ...rest }: Props) {
  const insets = useSafeAreaInsets();
  const bottom = (Platform.OS === 'ios' ? 0 : insets.bottom + 80) + (playerInset ? 72 : 0);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior={tabRoot ? 'never' : 'automatic'}
      keyboardDismissMode="on-drag"
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        tabRoot
          ? { paddingTop: insets.top + TAB_HEADER_TOP }
          : [
              Platform.OS === 'android' && { paddingTop: insets.top + Spacing.lg },
              Platform.OS === 'web' && { paddingTop: Spacing.xl },
            ],
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
