import type { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

import { hasNativeGlass } from '@/components/glass/Glass';
import type { Colors } from '@/theme/tokens';

type StackScreenOptions = NonNullable<ComponentProps<typeof Stack>['screenOptions']>;

/**
 * Shared native-stack header: large title, content scrolls underneath.
 * iOS 26 draws its own scroll-edge glass; older iOS gets a material blur.
 */
export function stackScreenOptions(colors: Colors): Exclude<StackScreenOptions, (...args: never[]) => unknown> {
  if (Platform.OS === 'web') {
    return {
      headerShown: true,
      headerShadowVisible: false,
      headerTintColor: colors.accent,
      headerTitleStyle: { color: colors.text },
      headerStyle: { backgroundColor: 'transparent' },
      contentStyle: { backgroundColor: 'transparent' },
    };
  }
  return {
    headerLargeTitle: true,
    headerTransparent: true,
    headerBlurEffect: hasNativeGlass ? undefined : 'systemChromeMaterial',
    headerShadowVisible: false,
    headerLargeTitleShadowVisible: false,
    headerTintColor: colors.accent,
    headerTitleStyle: { color: colors.text },
    headerLargeTitleStyle: { color: colors.text },
    headerStyle: { backgroundColor: 'transparent' },
    contentStyle: { backgroundColor: 'transparent' },
  };
}
