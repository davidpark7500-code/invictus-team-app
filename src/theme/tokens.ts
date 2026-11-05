import { Platform } from 'react-native';

/**
 * Design tokens, derived from the Invictus monogram: ink and paper.
 * The "accent" is the ink colour itself, inverted in dark mode, so
 * primary actions read as solid black (light) or solid white (dark)
 * pills. Colour is reserved for meaning (success / warning / danger).
 */

export type Scheme = 'light' | 'dark';

const shared = {
  success: '#1E9E5A',
  warning: '#D98A00',
  danger: '#D93B3B',
  stage: {
    tms: '#2F6BFF',
    dtm: '#7A5AF8',
    mg1: '#0FA3B1',
    mg2: '#F28C28',
    ge: '#1E9E5A',
  },
} as const;

export const palettes = {
  light: {
    ...shared,
    background: '#F2F2F7',
    backgroundElevated: '#FFFFFF',
    surface: 'rgba(255,255,255,0.62)',
    surfaceStrong: 'rgba(255,255,255,0.88)',
    surfaceSolid: '#FFFFFF',
    fill: 'rgba(120,120,128,0.12)',
    fillStrong: 'rgba(120,120,128,0.24)',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.14)',
    text: '#0B0B0F',
    textSecondary: '#5C5F66',
    textTertiary: '#8E9097',
    accent: '#0B0B0F',
    accentSoft: 'rgba(11,11,15,0.07)',
    onAccent: '#FFFFFF',
    glassTint: 'rgba(255,255,255,0.35)',
  },
  dark: {
    ...shared,
    background: '#000000',
    backgroundElevated: '#141418',
    surface: 'rgba(30,30,36,0.62)',
    surfaceStrong: 'rgba(30,30,36,0.88)',
    surfaceSolid: '#1C1C21',
    fill: 'rgba(120,120,128,0.24)',
    fillStrong: 'rgba(120,120,128,0.36)',
    border: 'rgba(255,255,255,0.10)',
    borderStrong: 'rgba(255,255,255,0.18)',
    text: '#F5F5F7',
    textSecondary: '#A8ABB3',
    textTertiary: '#6F7279',
    accent: '#F5F5F7',
    accentSoft: 'rgba(245,245,247,0.12)',
    onAccent: '#0B0B0F',
    glassTint: 'rgba(20,20,26,0.35)',
  },
} as const;

export type Colors = (typeof palettes)[Scheme];
export type ColorKey = keyof Colors;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Concentric radii: inner = outer - padding. */
export const Radius = {
  pill: 999,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

/** Apple HIG text styles, mapped to system fonts. */
export const Type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const, letterSpacing: 0.2 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: 0.1 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600' as const },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' as const },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' as const },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

export type TypeStyle = keyof typeof Type;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: { sans: 'var(--font-display)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
});

export const MaxContentWidth = 760;
