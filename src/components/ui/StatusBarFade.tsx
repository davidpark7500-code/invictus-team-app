import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * Web, opened from the Home Screen: the page runs under the status bar, so
 * without this, scrolled text slides right under the clock and battery.
 * Solid behind the status bar, then a short fade, like the native scroll edge.
 * Nothing in Safari itself, where the status bar has its own space.
 */
export function StatusBarFade() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  if (Platform.OS !== 'web' || insets.top === 0) return null;

  const height = insets.top + FADE;
  const solid = withAlpha(colors.background, 0.97);
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[solid, solid, withAlpha(colors.background, 0)]}
      locations={[0, insets.top / height, 1]}
      style={[styles.fade, { height }]}
    />
  );
}

const FADE = 20;

export function withAlpha(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', top: 0, left: 0, right: 0 },
});
