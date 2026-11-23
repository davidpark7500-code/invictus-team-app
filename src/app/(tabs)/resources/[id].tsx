import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Glass, GlassGroup } from '@/components/glass/Glass';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { formatDuration } from '@/data/format';
import { resources } from '@/data/mock';
import type { Resource } from '@/data/types';
import { usePlayer } from '@/features/audio/PlayerProvider';
import { InlineVideo } from '@/features/media/InlineVideo';
import { openDocument, shareDocument } from '@/features/media/openDocument';
import { KIND_ICON, KIND_LABEL } from '@/features/resources/kinds';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resource = resources.find((r) => r.id === id);
  const { colors } = useTheme();

  if (!resource) {
    return (
      <Screen>
        <Text color="textSecondary">Resource not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      {resource.kind === 'video' ? (
        <InlineVideo url={resource.url} title={resource.title} pendingLabel="Video link not connected yet." />
      ) : (
        <View style={[styles.hero, { backgroundColor: colors.brandSoft }]}>
          <Icon name={KIND_ICON[resource.kind]} size={44} color={colors.brandText} />
        </View>
      )}

      <View style={styles.pills}>
        <Pill label={resource.section} />
        <Pill label={KIND_LABEL[resource.kind]} />
      </View>
      <Text variant="title1">{resource.title}</Text>
      {resource.speaker ? (
        <Text variant="body" color="textSecondary">
          {resource.speaker}
        </Text>
      ) : null}

      {resource.kind === 'audio' ? <AudioControls resource={resource} /> : null}

      {resource.kind === 'pdf' || resource.kind === 'link' ? (
        <Card>
          <View style={styles.actions}>
            <Button
              label={resource.kind === 'pdf' ? 'View PDF' : 'Open link'}
              icon={KIND_ICON[resource.kind]}
              disabled={!resource.url}
              onPress={() => openDocument(resource.url)}
            />
            <Button
              label="Share"
              icon="share"
              variant="glass"
              disabled={!resource.url}
              onPress={() => shareDocument(resource.title, resource.url)}
            />
          </View>
        </Card>
      ) : null}

      {!resource.url ? (
        <Text variant="caption" color="textTertiary">
          File not connected yet.
        </Text>
      ) : null}
    </Screen>
  );
}

function AudioControls({ resource }: { resource: Resource }) {
  const { colors } = useTheme();
  const { track, playing, positionSec, play, toggle, seekBy } = usePlayer();
  const isCurrent = track?.id === resource.id;
  const position = isCurrent ? positionSec : 0;
  const duration = resource.durationSec ?? 0;

  return (
    <View style={styles.audio}>
      <View style={[styles.track, { backgroundColor: colors.fillStrong }]}>
        <View
          style={[styles.fill, { backgroundColor: colors.brand, width: `${duration ? (position / duration) * 100 : 0}%` }]}
        />
      </View>
      <View style={styles.times}>
        <Text variant="caption" color="textTertiary" mono>
          {formatDuration(position)}
        </Text>
        <Text variant="caption" color="textTertiary" mono>
          {duration ? `-${formatDuration(duration - position)}` : '--:--'}
        </Text>
      </View>
      <GlassGroup spacing={20} style={styles.controls}>
        <Control icon="rewind" onPress={() => seekBy(-15)} />
        <Control icon={isCurrent && playing ? 'pause' : 'play'} large onPress={() => (isCurrent ? toggle() : play(resource))} />
        <Control icon="forward" onPress={() => seekBy(30)} />
      </GlassGroup>
    </View>
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
  content: { paddingTop: Spacing.lg },
  hero: { width: 96, height: 96, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  actions: { gap: Spacing.sm },
  audio: { gap: Spacing.sm, marginTop: Spacing.sm },
  track: { height: 6, borderRadius: Radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.pill },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xl, marginTop: Spacing.md },
});
