import { Platform, ScrollView, type ScrollViewProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabRootScroll } from '@/components/ui/TabHeader';
import { useScreenGlowStyle } from '@/features/leaderboard/GlowBackground';
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
  const tabTop = useTabRootScroll();
  const glow = useScreenGlowStyle();
  const bottom = (Platform.OS === 'ios' ? 0 : insets.bottom + 80) + (playerInset ? 72 : 0);

  return (
    // The ScrollView must be the screen's first view, or iOS won't shrink the tab bar on
    // scroll; the glow is its background (see useScreenGlowStyle).
    <View style={styles.screen}>
      <ScrollView
        contentInsetAdjustmentBehavior={tabRoot ? tabTop.contentInsetAdjustmentBehavior : 'automatic'}
        keyboardDismissMode="on-drag"
        style={[styles.scroll, glow]}
        contentContainerStyle={[
          styles.content,
          tabRoot
            ? { paddingTop: tabTop.paddingTop }
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: Spacing.lg },
  column: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.lg },
});
