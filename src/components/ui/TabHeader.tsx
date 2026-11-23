import type { ReactNode } from 'react';
import { Platform, type PressableProps, StyleSheet, View } from 'react-native';

import { Glass } from '@/components/glass/Glass';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { Radius, Spacing } from '@/theme/tokens';

/**
 * Fixed row height, so the logo sits in exactly the same spot on every tab
 * whether the title has a subtitle or buttons beside it (Leaderboard) or not.
 */
export const TAB_HEADER_HEIGHT = 44;

/** Space above the header row. Every tab's scroll view adds the safe-area top to this. */
export const TAB_HEADER_TOP = Spacing.md;

type Props = {
  title: string;
  subtitle?: string;
  /** Buttons on the right, such as alerts or account. */
  children?: ReactNode;
};

/**
 * Top row of every tab except Home: the Invictus logo at top left, then the
 * tab's title. Screens that use it hide the native stack header.
 */
export function TabHeader({ title, subtitle, children }: Props) {
  return (
    <View style={styles.header}>
      <BrandLogo width={54} />
      <View style={styles.text}>
        <Text variant="title3" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type HeaderButtonProps = Omit<PressableProps, 'children'> & {
  icon: IconName;
  accessibilityLabel: string;
};

/** Round glass button for the header row (alerts, settings). */
export function HeaderButton({ icon, ...rest }: HeaderButtonProps) {
  return (
    <Pressable hitSlop={8} {...rest}>
      <Glass interactive radius={Radius.pill} style={styles.round}>
        <Icon name={icon} size={18} />
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // iOS insets the scroll view only to the status bar once the stack header is hidden.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: TAB_HEADER_HEIGHT,
    marginTop: Platform.OS === 'ios' ? Spacing.md : 0,
  },
  text: { flex: 1 },
  round: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
