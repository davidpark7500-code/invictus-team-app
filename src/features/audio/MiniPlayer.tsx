import { useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass, hasNativeGlass } from '@/components/glass/Glass';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { usePlayer } from '@/features/audio/PlayerProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Props = {
  /** 'inline' = tab bar minimized on iOS 26, so the player sits beside it. */
  placement?: 'regular' | 'inline';
};

export function MiniPlayer({ placement = 'regular' }: Props) {
  const { track, playing, toggle } = usePlayer();
  const { colors } = useTheme();
  const router = useRouter();
  if (!track) return null;

  const compact = placement === 'inline';
  return (
    <Pressable onPress={() => router.push(`/resources/${track.id}`)} haptic={false} style={styles.hit}>
      <Glass variant="regular" radius={Radius.pill} style={[styles.bar, compact && styles.barCompact]}>
        <View style={[styles.art, { backgroundColor: colors.brandSoft }]}>
          <Icon name="waveform" size={16} color={colors.brandText} />
        </View>
        <View style={styles.text}>
          <Text variant="subheadline" numberOfLines={1} style={styles.title}>
            {track.title}
          </Text>
          {!compact ? (
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {track.speaker ?? track.section}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={toggle} hitSlop={10} style={styles.control}>
          <Icon name={playing ? 'pause' : 'play'} size={20} />
        </Pressable>
      </Glass>
    </Pressable>
  );
}

/** Non-iOS-26 fallback: float the player above the tab bar. */
export function FloatingMiniPlayer() {
  const insets = useSafeAreaInsets();
  const { track } = usePlayer();
  if (hasNativeGlass || !track) return null;
  const bottom = Platform.select({ ios: 49 + insets.bottom, android: 80 + insets.bottom, default: 72 });
  return (
    <View pointerEvents="box-none" style={[styles.floating, { bottom: bottom + Spacing.sm }]}>
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  hit: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 56,
  },
  barCompact: { minHeight: 48, paddingVertical: Spacing.xs },
  art: { width: 40, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  title: { fontWeight: '600' },
  control: { padding: Spacing.xs },
  floating: { position: 'absolute', left: Spacing.lg, right: Spacing.lg },
});
