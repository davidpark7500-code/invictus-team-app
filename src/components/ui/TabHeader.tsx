import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/theme/tokens';

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

const styles = StyleSheet.create({
  // iOS insets the scroll view only to the status bar once the stack header is hidden.
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Platform.OS === 'ios' ? Spacing.md : 0 },
  text: { flex: 1 },
});
