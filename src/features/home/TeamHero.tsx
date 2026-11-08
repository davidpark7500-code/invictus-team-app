import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { palettes, Radius, Spacing } from '@/theme/tokens';

/** Ink used under the photo in both themes, so white text always reads. */
const INK = '#0B0B0F';

/**
 * Team photo as a full-width hero. The photo sits at the top of a dark card and
 * fades into it, so the welcome line sits below the people, never on their faces.
 */
export function TeamHero() {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(500)} style={[styles.card, { borderColor: colors.border }]}>
      <View style={styles.photo}>
        <Image
          source={require('@/assets/team-photo.jpg')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          accessibilityLabel="The Invictus team together at an event"
        />
        <LinearGradient
          colors={['rgba(11,11,15,0)', 'rgba(11,11,15,0.35)', INK]}
          locations={[0.86, 0.95, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>
      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.copy}>
        <Text variant="caption" style={[styles.eyebrow, { color: palettes.dark.brandText }]}>
          THE INVICTUS TEAM
        </Text>
        <Text variant="title1" style={styles.title}>
          Welcome to the Movement.
        </Text>
        <Text variant="subheadline" style={styles.subtitle}>
          Welcome to our Culture.
        </Text>
      </Animated.View>
      <View style={styles.sheen} pointerEvents="none" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: INK,
  },
  /** Source photo is 1093 × 618; the box matches it exactly so no one is cropped. */
  photo: { width: '100%', aspectRatio: 1093 / 618 },
  copy: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xs, paddingBottom: Spacing.xl, gap: Spacing.xxs },
  eyebrow: { letterSpacing: 1.6, fontWeight: '700' },
  title: { color: '#FFFFFF' },
  subtitle: { color: 'rgba(255,255,255,0.85)' },
  // Thin top highlight, like light catching a glass edge.
  sheen: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
});
