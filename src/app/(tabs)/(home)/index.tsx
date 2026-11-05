import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { formatDateTime, formatDuration, formatRelativeDay, greeting } from '@/data/format';
import { announcements, audios, events } from '@/data/mock';
import { usePlayer } from '@/features/audio/PlayerProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { play } = usePlayer();

  const now = Date.now();
  const nextEvent = events
    .filter((e) => new Date(e.startsAt).getTime() > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const pinned = announcements.find((a) => a.pinned);
  const latest = audios.slice(0, 3);

  return (
    <Screen>
      <Text variant="title3" color="textSecondary">
        {greeting()}
      </Text>

      {nextEvent ? (
        <Card onPress={() => router.push(`/events/${nextEvent.id}`)} tintColor={colors.accentSoft}>
          <View style={styles.cardHead}>
            <Pill label="Next up" filled />
            <Text variant="caption" color="textSecondary">
              {formatRelativeDay(nextEvent.startsAt)}
            </Text>
          </View>
          <Text variant="title2" style={styles.cardTitle}>
            {nextEvent.title}
          </Text>
          <View style={styles.metaRow}>
            <Icon name="clock" size={14} color={colors.textSecondary} />
            <Text variant="subheadline" color="textSecondary">
              {formatDateTime(nextEvent.startsAt)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Icon name={nextEvent.isVirtual ? 'video' : 'pin'} size={14} color={colors.textSecondary} />
            <Text variant="subheadline" color="textSecondary">
              {nextEvent.location}
            </Text>
          </View>
        </Card>
      ) : null}

      {pinned ? (
        <Card>
          <View style={styles.inlineHead}>
            <Icon name="bell" size={16} color={colors.warning} />
            <Text variant="headline" style={styles.inlineTitle}>
              {pinned.title}
            </Text>
          </View>
          <Text variant="subheadline" color="textSecondary">
            {pinned.body}
          </Text>
        </Card>
      ) : null}

      <SectionHeader title="New audio" action="See all" onAction={() => router.push('/audio')} />
      {latest.map((a) => (
        <ListRow
          key={a.id}
          title={a.title}
          subtitle={`${a.speaker} · ${a.series}`}
          meta={formatDuration(a.durationSec)}
          leading={
            <View style={[styles.play, { backgroundColor: colors.accent }]}>
              <Icon name="play" size={16} color={colors.onAccent} />
            </View>
          }
          onPress={() => play(a)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  inlineHead: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  inlineTitle: { flex: 1 },
  cardTitle: { marginTop: Spacing.sm, marginBottom: Spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xxs },
  play: { width: 40, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
