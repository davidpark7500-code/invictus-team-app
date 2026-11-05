import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Glass, GlassGroup } from '@/components/glass/Glass';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { formatDate, formatDuration } from '@/data/format';
import { audios } from '@/data/mock';
import { usePlayer } from '@/features/audio/PlayerProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

export default function NowPlayingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const audio = audios.find((a) => a.id === id);
  const { colors } = useTheme();
  const { track, playing, positionSec, play, toggle, seekBy } = usePlayer();

  if (!audio) {
    return (
      <Screen>
        <Text color="textSecondary">Audio not found.</Text>
      </Screen>
    );
  }

  const isCurrent = track?.id === audio.id;
  const position = isCurrent ? positionSec : 0;
  const progress = audio.durationSec ? position / audio.durationSec : 0;

  return (
    <Screen playerInset={false} contentContainerStyle={styles.content}>
      <View style={[styles.artwork, { backgroundColor: colors.accentSoft }]}>
        <Icon name="waveform" size={72} color={colors.accent} weight="thin" />
      </View>

      <View style={styles.titles}>
        <Pill label={audio.series} />
        <Text variant="title1" style={styles.title}>
          {audio.title}
        </Text>
        <Text variant="body" color="textSecondary">
          {audio.speaker} · {formatDate(audio.recordedAt, { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>

      <View style={styles.progress}>
        <View style={[styles.track, { backgroundColor: colors.fillStrong }]}>
          <View style={[styles.fill, { backgroundColor: colors.accent, width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.times}>
          <Text variant="caption" color="textTertiary" mono>
            {formatDuration(position)}
          </Text>
          <Text variant="caption" color="textTertiary" mono>
            -{formatDuration(audio.durationSec - position)}
          </Text>
        </View>
      </View>

      <GlassGroup spacing={20} style={styles.controls}>
        <Control icon="rewind" onPress={() => seekBy(-15)} />
        <Control
          icon={isCurrent && playing ? 'pause' : 'play'}
          large
          onPress={() => (isCurrent ? toggle() : play(audio))}
        />
        <Control icon="forward" onPress={() => seekBy(30)} />
      </GlassGroup>

      <Text variant="caption" color="textTertiary" style={styles.note}>
        Playback engine not wired yet. Controls update state only.
      </Text>
    </Screen>
  );
}

function Control({ icon, large, onPress }: { icon: 'play' | 'pause' | 'rewind' | 'forward'; large?: boolean; onPress: () => void }) {
  const size = large ? 76 : 56;
  return (
    <Pressable onPress={onPress} scaleTo={0.92}>
      <Glass interactive radius={Radius.pill} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={large ? 32 : 22} />
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.xl },
  artwork: { alignSelf: 'center', width: 240, height: 240, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  titles: { alignItems: 'center', gap: Spacing.sm },
  title: { textAlign: 'center' },
  progress: { gap: Spacing.sm, marginTop: Spacing.sm },
  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, marginTop: Spacing.md },
  note: { textAlign: 'center', marginTop: Spacing.lg },
});
