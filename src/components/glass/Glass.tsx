import { BlurView } from 'expo-blur';
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Radius } from '@/theme/tokens';

export type GlassVariant = 'regular' | 'clear';

export type GlassProps = ViewProps & {
  variant?: GlassVariant;
  /** Glass responds to touch (iOS 26 only). Use for buttons and controls. */
  interactive?: boolean;
  tintColor?: string;
  radius?: number;
  /** Force a non-blurred solid surface (e.g. inside long lists on Android). */
  solid?: boolean;
  /**
   * Web only: blur what's behind. Off for content cards, which only ever sit on
   * the soft glow (blurring it changes nothing you can see, and a blur per card
   * makes scrolling stutter on iPhone). Floating bars and buttons keep it.
   */
  blur?: boolean;
};

export const hasNativeGlass =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

/**
 * A glass surface.
 * - iOS 26+: real Liquid Glass via UIGlassEffect.
 * - iOS < 26 and web: system material blur.
 * - Android: blur for floating bars; callers pass `solid` for list content.
 * - Reduce Transparency on: opaque elevated surface everywhere.
 */
export function Glass({
  variant = 'regular',
  interactive = false,
  tintColor,
  radius = Radius.lg,
  solid = false,
  blur: _blur,
  style,
  children,
  ...rest
}: GlassProps) {
  const { scheme, colors, reduceTransparency } = useTheme();

  if (reduceTransparency || solid) {
    return (
      <View
        {...rest}
        style={[
          styles.base,
          { borderRadius: radius, backgroundColor: colors.surfaceSolid, borderColor: colors.border },
          styles.hairline,
          style,
        ]}>
        {children}
      </View>
    );
  }

  if (hasNativeGlass) {
    return (
      <GlassView
        {...rest}
        glassEffectStyle={variant}
        isInteractive={interactive}
        tintColor={tintColor}
        colorScheme={scheme}
        style={[styles.base, { borderRadius: radius }, style]}>
        {children}
      </GlassView>
    );
  }

  const tint = scheme === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight';
  return (
    <BlurView
      {...rest}
      tint={tint}
      intensity={variant === 'clear' ? 40 : 70}
      blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
      style={[
        styles.base,
        styles.hairline,
        {
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: tintColor ?? (variant === 'clear' ? colors.glassTint : colors.surface),
          borderColor: colors.border,
        },
        style,
      ]}>
      {children}
    </BlurView>
  );
}

/**
 * Groups glass children so they merge when close together (iOS 26).
 * Plain View elsewhere.
 */
export function GlassGroup({ spacing = 12, style, children, ...rest }: ViewProps & { spacing?: number }) {
  if (hasNativeGlass) {
    return (
      <GlassContainer spacing={spacing} style={style} {...rest}>
        {children}
      </GlassContainer>
    );
  }
  return (
    <View style={style} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {},
  hairline: { borderWidth: StyleSheet.hairlineWidth },
});
