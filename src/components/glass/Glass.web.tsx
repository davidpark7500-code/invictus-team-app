import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Radius } from '@/theme/tokens';

import type { GlassProps } from './Glass';

export const hasNativeGlass = false;

/** Web: CSS backdrop-filter glass with a hairline edge highlight. */
export function Glass({ variant = 'regular', tintColor, radius = Radius.lg, solid = false, style, children, ...rest }: GlassProps) {
  const { colors, reduceTransparency } = useTheme();
  const opaque = solid || reduceTransparency;
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
        !opaque && ({ backdropFilter: 'blur(24px) saturate(1.6)', WebkitBackdropFilter: 'blur(24px) saturate(1.6)' } as object),
        style,
      ]}>
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
});
