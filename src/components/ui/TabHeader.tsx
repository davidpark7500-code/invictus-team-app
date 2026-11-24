import type { ReactNode } from 'react';
import { Platform, type ScrollViewProps, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { Text } from '@/components/ui/Text';
import { AccountButton } from '@/features/account/AccountButton';
import { Spacing } from '@/theme/tokens';

/**
 * Fixed row height, so the logo sits in exactly the same spot on every tab
 * whether the title has a subtitle or buttons beside it (Leaderboard) or not.
 */
export const TAB_HEADER_HEIGHT = 44;

/** Space above the header row, below the status bar. */
export const TAB_HEADER_TOP = Spacing.md;

/**
 * Scroll-view settings for a tab's first screen, so the header row sits the
 * same distance below the status bar on every tab.
 * iPhone: iOS already insets a tab's scroll view below the status bar, so
 * adding the safe-area top as well doubled the gap. Web and Android: nothing
 * does it for us, so pad by the safe-area top.
 */
export function useTabRootScroll(): { contentInsetAdjustmentBehavior: ScrollViewProps['contentInsetAdjustmentBehavior']; paddingTop: number } {
  const insets = useSafeAreaInsets();
  return Platform.OS === 'ios'
    ? { contentInsetAdjustmentBehavior: 'automatic', paddingTop: TAB_HEADER_TOP }
    : { contentInsetAdjustmentBehavior: 'never', paddingTop: insets.top + TAB_HEADER_TOP };
}

type Props = {
  title: string;
  subtitle?: string;
  /** Extra buttons, shown just before the account button. */
  children?: ReactNode;
};

/**
 * Top row of every tab except Home: the Invictus logo at top left, the tab's
 * title, and the account button at top right (the same spot on Home).
 * Screens that use it hide the native stack header.
 */
export function TabHeader({ title, subtitle, children }: Props) {
  return (
    <View>
      {/* Exactly the same row on every tab, so the logo and title line up across tabs. */}
      <View style={styles.header}>
        <BrandLogo width={LOGO_WIDTH} />
        <Text variant="title3" accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {children}
        <AccountButton />
      </View>
      {/* Under the title, outside the row, so it can't move the logo or the title. */}
      {subtitle ? (
        <Text variant="footnote" color="textSecondary" numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const LOGO_WIDTH = 54;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    height: TAB_HEADER_HEIGHT,
  },
  title: { flex: 1 },
  // Starts where the title starts (logo + gap), tucked just under it.
  subtitle: { marginLeft: LOGO_WIDTH + Spacing.md, marginTop: -Spacing.sm },
});
