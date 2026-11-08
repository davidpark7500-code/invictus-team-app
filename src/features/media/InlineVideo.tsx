import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

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
  return (
    <View style={styles.frame}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        nativeControls
        contentFit="contain"
        allowsPictureInPicture
        accessibilityLabel={`Video: ${title}`}
      />
    </View>
  );
}

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
  frame: { aspectRatio: 16 / 9, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#000' },
  pending: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg },
});
