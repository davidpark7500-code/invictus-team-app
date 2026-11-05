import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/** Logo aspect ratio from the trimmed source artwork (488 × 254). */
const RATIO = 488 / 254;

type Props = { width?: number; style?: StyleProp<ImageStyle> };

/** The Invictus monogram, black on light surfaces and white on dark. */
export function BrandLogo({ width = 200, style }: Props) {
  const { scheme } = useTheme();
  return (
    <Image
      source={
        scheme === 'dark'
          ? require('@/assets/brand/logo-white.png')
          : require('@/assets/brand/logo-black.png')
      }
      style={[{ width, height: width / RATIO }, style]}
      contentFit="contain"
      accessibilityLabel="Invictus"
    />
  );
}
