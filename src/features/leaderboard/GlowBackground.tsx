import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

/** "rgba(r,g,b,a)" -> SVG colour + opacity (stopColor doesn't take alpha everywhere). */
function split(rgba: string) {
  const [r, g, b, a] = rgba.replace(/rgba\(|\)/g, '').split(',').map((v) => Number(v.trim()));
  return { color: `rgb(${r},${g},${b})`, opacity: a };
}

/**
 * Four soft colour blobs behind everything, so the glass has something to
 * refract. The solid screen colour sits UNDER this layer (on the root view);
 * a top fade stops it ending in a hard band under the status bar.
 */
function glowBlobs(colors: { glowGold: string; glowBlue: string }) {
  // x, y as fractions of the screen; r as a fraction of the larger side (from the web CSS).
  return [
    { id: 'g1', x: 0, y: 0.04, r: 0.52, ...split(colors.glowGold) },
    { id: 'g2', x: 1, y: 0.36, r: 0.5, ...split(colors.glowBlue) },
    // Blue and gold only (owner, Nov 2026): this patch was violet.
    { id: 'g3', x: 0.06, y: 0.74, r: 0.46, ...split(colors.glowBlue) },
    { id: 'g4', x: 0.92, y: 1, r: 0.44, ...split(colors.glowGold) },
  ];
}

export function GlowBackground() {
  const { colors, reduceTransparency } = useTheme();
  const { width, height } = useWindowDimensions();
  if (reduceTransparency) return null;

  const big = Math.max(width, height);
  const blobs = glowBlobs(colors);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Defs>
          {blobs.map((b) => (
            <RadialGradient key={b.id} id={b.id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
              <Stop offset="0.68" stopColor={b.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {blobs.map((b) => (
          <Circle key={b.id} cx={b.x * width} cy={b.y * height} r={b.r * big} fill={`url(#${b.id})`} />
        ))}
      </Svg>
      {/* Fade in from the top: background colour at 0, ~35% glow at 60pt, full glow by 200pt. */}
      <LinearGradient
        colors={[colors.background, withAlpha(colors.background, 0.65), withAlpha(colors.background, 0)]}
        locations={[0, 0.3, 1]}
        style={styles.fade}
      />
    </View>
  );
}

/**
 * The same glow, as a style for a screen's ScrollView (iPhone and Android app).
 *
 * Why a style and not a view behind the list: iOS only shrinks the tab bar on scroll
 * (and collapses large titles) when the scroll view is the FIRST view on the screen,
 * following first children all the way down. A glow view placed before the list takes
 * that spot. As a background image, the glow is drawn on the ScrollView's own outer
 * view, which doesn't move when the list scrolls.
 */
export function useScreenGlowStyle() {
  const { colors, reduceTransparency } = useTheme();
  const { width, height } = useWindowDimensions();
  if (Platform.OS === 'web' || reduceTransparency) return undefined;

  const big = Math.max(width, height);
  const bg = colors.background;
  const layers = [
    // Fade in from the top: background colour at 0, ~35% glow at 60pt, full glow by 200pt.
    `linear-gradient(to bottom, ${withAlpha(bg, 1)} 0px, ${withAlpha(bg, 0.65)} 60px, ${withAlpha(bg, 0)} 200px)`,
    ...glowBlobs(colors).map((b) => {
      const rgb = b.color.replace('rgb(', '').replace(')', '');
      return `radial-gradient(circle ${Math.round(b.r * big)}px at ${Math.round(b.x * width)}px ${Math.round(b.y * height)}px, rgba(${rgb},${b.opacity}) 0%, rgba(${rgb},0) 68%)`;
    }),
  ];
  return { backgroundImage: layers.join(', ') };
}

/**
 * The glow behind one screen with no scrolling list (sign-in), for the iPhone and Android app. There, the native
 * tab bar and screen containers paint a solid background over the app-wide glow,
 * so each screen draws its own. The web shows the app-wide one, so this is empty.
 */
export function ScreenGlow() {
  return Platform.OS === 'web' ? null : <GlowBackground />;
}

function withAlpha(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
});
