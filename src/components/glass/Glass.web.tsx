import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Radius } from '@/theme/tokens';

import type { GlassProps } from './Glass';

export const hasNativeGlass = false;

/**
 * What makes a translucent panel read as glass rather than a grey box: a
 * bright rim along the top edge where light catches it, a faint sheen that
 * fades down the surface, and a soft shadow lifting it off the background.
 */
const LIGHT = {
  dark: {
    shadow: 'inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(255,255,255,0.04), 0 10px 30px rgba(0,0,0,0.35)',
    sheen: ['rgba(255,255,255,0.09)', 'rgba(255,255,255,0)'] as const,
  },
  light: {
    shadow: 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.35), 0 8px 24px rgba(20,20,40,0.08)',
    sheen: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)'] as const,
  },
};

/** Web: translucent glass with a lit rim; floating chrome also blurs what's behind it. */
export function Glass({
  variant = 'regular',
  interactive: _interactive,
  tintColor,
  radius = Radius.lg,
  solid = false,
  blur = true,
  style,
  children,
  ...rest
}: GlassProps) {
  const { colors, scheme, reduceTransparency } = useTheme();
  const opaque = solid || reduceTransparency;
  const light = LIGHT[scheme];
  return (
    <View
      {...rest}
      style={[
        styles.base,
        {
          borderRadius: radius,
          borderColor: colors.border,
          backgroundColor: opaque ? colors.surfaceSolid : (tintColor ?? (variant === 'clear' ? colors.glassTint : colors.surface)),
        },
        !opaque && ({ boxShadow: light.shadow } as object),
        !opaque && blur && ({ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' } as object),
        style,
      ]}>
      {opaque ? null : (
        <LinearGradient colors={light.sheen} locations={[0, 0.6]} style={styles.sheen} pointerEvents="none" />
      )}
      {children}
    </View>
  );
}

export function GlassGroup({ style, children, ...rest }: ViewProps & { spacing?: number }) {
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  sheen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
