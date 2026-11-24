import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Radius } from '@/theme/tokens';

import type { GlassProps } from './Glass';
import { GLASS_LIGHT as LIGHT } from './rim';

export const hasNativeGlass = false;

/** Web: translucent glass with a lit rim; floating chrome also blurs what's behind it. */
export function Glass({
  variant = 'regular',
  interactive: _interactive,
  tintColor,
  radius = Radius.lg,
  solid = false,
  blur = true,
  content = false,
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
        !opaque && blur && !content && ({ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' } as object),
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
