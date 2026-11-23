import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

import { toDirectMediaUrl } from './dropbox';

type Props = {
  url?: string;
  title: string;
  /** Shown until a URL is connected. */
  pendingLabel?: string;
};

/**
 * Plays video inside the app with native controls, full screen and
 * picture-in-picture. Streams straight from the file URL; no Dropbox app.
 */
export function InlineVideo({ url, title, pendingLabel = 'Video coming soon.' }: Props) {
  if (!url) return <Pending label={pendingLabel} />;
  return <Player url={toDirectMediaUrl(url)} title={title} />;
}

function Player({ url, title }: { url: string; title: string }) {
  const player = useVideoPlayer({ uri: url, metadata: { title, artist: 'Invictus Team' } }, (p) => {
    p.staysActiveInBackground = true;
    p.showNowPlayingNotification = true;
  });
  // Until the first tap the player is just a black box, invisible on the dark theme.
  const [started, setStarted] = useState(false);
  const { colors } = useTheme();
  return (
    <View style={[styles.frame, { borderColor: colors.border }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        nativeControls={started}
        contentFit="contain"
        allowsPictureInPicture
        accessibilityLabel={`Video: ${title}`}
      />
      {started ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Play ${title}`}
          onPress={() => {
            setStarted(true);
            player.play();
          }}
          style={StyleSheet.absoluteFill}>
          <LinearGradient colors={COVER} style={[StyleSheet.absoluteFill, styles.cover]}>
            <View style={[styles.play, { backgroundColor: colors.brand }]}>
              <Icon name="play" size={30} color={colors.onBrand} />
            </View>
            <Text variant="footnote" style={styles.coverLabel}>
              Tap to play
            </Text>
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

/** Lifted, slightly warm cover, so the box reads as a video in both themes. */
const COVER = ['#2A2A33', '#15151A'] as const;

function Pending({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.frame, styles.pending, { backgroundColor: colors.fill }]}>
      <Icon name="video" size={36} color={colors.textSecondary} />
      <Text variant="footnote" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { aspectRatio: 16 / 9, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#000', borderWidth: StyleSheet.hairlineWidth },
  cover: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  play: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4, // the triangle's visual centre sits left of its box
    boxShadow: '0 6px 18px rgba(0,0,0,0.45)',
  },
  coverLabel: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  pending: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg },
});
