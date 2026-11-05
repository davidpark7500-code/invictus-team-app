import { StyleSheet, Text as RNText, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { type ColorKey, Fonts, Type, type TypeStyle } from '@/theme/tokens';

export type AppTextProps = TextProps & {
  variant?: TypeStyle;
  color?: ColorKey;
  rounded?: boolean;
  mono?: boolean;
};

export function Text({ variant = 'body', color = 'text', rounded, mono, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  const tone = colors[color];
  return (
    <RNText
      {...rest}
      style={[
        Type[variant],
        styles.base,
        { color: typeof tone === 'string' ? tone : colors.text },
        rounded && { fontFamily: Fonts?.rounded },
        mono && { fontFamily: Fonts?.mono },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { fontFamily: Fonts?.sans },
});
