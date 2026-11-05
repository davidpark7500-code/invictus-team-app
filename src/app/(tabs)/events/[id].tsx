import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { formatDateTime } from '@/data/format';
import { events } from '@/data/mock';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

import { EVENT_LABEL } from './index';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const event = events.find((e) => e.id === id);
  const { colors } = useTheme();

  if (!event) {
    return (
      <Screen>
        <Text color="textSecondary">Event not found.</Text>
      </Screen>
    );
  }

  const past = new Date(event.endsAt).getTime() < Date.now();

  return (
    <Screen contentContainerStyle={styles.content}>
      <Pill label={EVENT_LABEL[event.type]} />
      <Text variant="title1">{event.title}</Text>

      <Card>
        <Row icon="clock" text={`${formatDateTime(event.startsAt)} – ${new Date(event.endsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`} />
        <Row icon={event.isVirtual ? 'video' : 'pin'} text={event.location} />
      </Card>

      <Text variant="body" color="textSecondary">
        {event.description}
      </Text>

      <View style={styles.actions}>
        {past ? (
          <Button label="Watch recording" icon="play" disabled={event.recordingUrl === undefined} />
        ) : (
          <>
            <Button label={event.isVirtual ? 'Join / Register' : 'Register'} icon="link" disabled={event.registrationUrl === undefined} />
            <Button label="Add to calendar" icon="events" variant="glass" />
          </>
        )}
      </View>
      <Text variant="caption" color="textTertiary">
        Times shown in your device time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone}).
      </Text>
      <View style={{ height: 0, borderColor: colors.border }} />
    </Screen>
  );
}

function Row({ icon, text }: { icon: 'clock' | 'video' | 'pin'; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Icon name={icon} size={16} color={colors.accent} />
      <Text variant="subheadline" style={styles.rowText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs },
  rowText: { flex: 1 },
  actions: { gap: Spacing.sm },
});
