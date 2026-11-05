import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { formatDateTime } from '@/data/format';
import { events } from '@/data/mock';
import type { EventType } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

export const EVENT_LABEL: Record<EventType, string> = {
  group_evaluation: 'Group Evaluation',
  team_training: 'Training',
  conference: 'Conference',
  social: 'Social',
};

export default function EventsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.endsAt).getTime() >= now).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = events.filter((e) => new Date(e.endsAt).getTime() < now).sort((a, b) => b.startsAt.localeCompare(a.startsAt));

  return (
    <Screen>
      <SectionHeader title="Upcoming" />
      {upcoming.map((e) => {
        const d = new Date(e.startsAt);
        return (
          <Card key={e.id} onPress={() => router.push(`/events/${e.id}`)} padded={false} style={styles.row}>
            <View style={[styles.date, { backgroundColor: colors.accentSoft }]}>
              <Text variant="caption" color="accent">
                {d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
              </Text>
              <Text variant="title2" color="accent" rounded>
                {d.getDate()}
              </Text>
            </View>
            <View style={styles.body}>
              <Pill label={EVENT_LABEL[e.type]} />
              <Text variant="headline">{e.title}</Text>
              <Text variant="subheadline" color="textSecondary">
                {formatDateTime(e.startsAt)}
              </Text>
              <View style={styles.meta}>
                <Icon name={e.isVirtual ? 'video' : 'pin'} size={13} color={colors.textTertiary} />
                <Text variant="caption" color="textTertiary">
                  {e.location}
                </Text>
              </View>
            </View>
            <Icon name="chevron" size={14} color={colors.textTertiary} />
          </Card>
        );
      })}

      {past.length ? (
        <>
          <SectionHeader title="Recordings" />
          {past.map((e) => (
            <ListRow
              key={e.id}
              icon="video"
              title={e.title}
              subtitle={formatDateTime(e.startsAt)}
              meta={e.recordingUrl !== undefined ? 'Recording available' : undefined}
              onPress={() => router.push(`/events/${e.id}`)}
            />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  date: { width: 56, height: 64, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: Spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
});
