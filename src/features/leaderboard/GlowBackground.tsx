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
export function GlowBackground() {
  const { colors, reduceTransparency } = useTheme();
  const { width, height } = useWindowDimensions();
  if (reduceTransparency) return null;

  const big = Math.max(width, height);
  // x, y as fractions of the screen; r as a fraction of the larger side (from the web CSS).
  const blobs = [
    { id: 'g1', x: 0, y: 0.04, r: 0.52, ...split(colors.glowGold) },
    { id: 'g2', x: 1, y: 0.36, r: 0.5, ...split(colors.glowBlue) },
    { id: 'g3', x: 0.06, y: 0.74, r: 0.46, ...split(colors.glowViolet) },
    { id: 'g4', x: 0.92, y: 1, r: 0.44, ...split(colors.glowGold) },
  ];

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
 * The glow behind one screen, for the iPhone and Android app. There, the native
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
