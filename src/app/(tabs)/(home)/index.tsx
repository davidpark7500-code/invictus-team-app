import { Link, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HeaderButton, TAB_HEADER_HEIGHT } from '@/components/ui/TabHeader';
import { Text } from '@/components/ui/Text';
import { TeamHero } from '@/features/home/TeamHero';
import { eventDay, formatEventPlace, formatEventWhen, formatRelativeDay, greeting, isUpcoming } from '@/data/format';
import { events, registrationUrlOf, resources, WELCOME } from '@/data/mock';
import type { TeamEvent } from '@/data/types';
import { openDocument } from '@/features/media/openDocument';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const upcoming = events.filter((e) => isUpcoming(e)).sort((a, b) => a.date.localeCompare(b.date));
  const nextEvent = upcoming[0];
  const nextGroupEval = upcoming.find((e) => e.type === 'group_evaluation');
  const talks = resources.filter((r) => r.section === 'Onboarding Talks');

  return (
    <Screen tabRoot>
      <View style={styles.top}>
        <View style={styles.brand}>
          <BrandLogo width={150} />
          <Text variant="title3" color="textSecondary">
            {greeting()}
          </Text>
        </View>
        {/* Same height and spot as the buttons in Leaderboard's header row. */}
        <View style={styles.topBar}>
          <Link href="/settings" asChild>
            <HeaderButton icon="settings" accessibilityLabel="Settings" />
          </Link>
        </View>
      </View>

      <TeamHero />

      <Card>
        {WELCOME.map((para) => (
          <Text key={para.slice(0, 16)} variant="callout" style={styles.welcome}>
            {para}
          </Text>
        ))}
      </Card>

      {nextEvent ? <EventCard event={nextEvent} label="Next up" /> : null}
      {/* The guest link always rides with the next Group Evaluation, even when something else is sooner. */}
      {nextGroupEval && nextGroupEval.id !== nextEvent?.id ? <EventCard event={nextGroupEval} label="Next Group Evaluation" /> : null}

      <SectionHeader title="Onboarding Talks" action="All resources" onAction={() => router.push('/resources')} />
      {talks.map((t) => (
        <ListRow
          key={t.id}
          title={t.title}
          subtitle={t.speaker}
          leading={
            <View style={[styles.play, { backgroundColor: colors.brand }]}>
              <Icon name="play" size={16} color={colors.onBrand} />
            </View>
          }
          onPress={() => router.push(`/resources/${t.id}`)}
        />
      ))}
    </Screen>
  );
}

/** An upcoming event; Group Evaluations carry the guest registration button. */
function EventCard({ event, label }: { event: TeamEvent; label: string }) {
  const { colors } = useTheme();
  const router = useRouter();
  const guestUrl = event.type === 'group_evaluation' ? registrationUrlOf(event) : undefined;
  return (
    <Card onPress={() => router.push(`/events/${event.id}`)} tintColor={colors.brandSoft}>
      <View style={styles.cardHead}>
        <Pill label={label} filled color={colors.brand} textColor={colors.onBrand} />
        <Text variant="caption" color="textSecondary">
          {formatRelativeDay(eventDay(event))}
        </Text>
      </View>
      <Text variant="title2" style={styles.cardTitle}>
        {event.title}
      </Text>
      <View style={styles.metaRow}>
        <Icon name="clock" size={14} color={colors.textSecondary} />
        <Text variant="subheadline" color="textSecondary">
          {formatEventWhen(event)}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Icon name={event.isVirtual ? 'video' : 'pin'} size={14} color={colors.textSecondary} />
        <Text variant="subheadline" color="textSecondary">
          {formatEventPlace(event)}
        </Text>
      </View>
      {guestUrl ? (
        <View style={styles.cardAction}>
          <Button label="Register a guest" icon="link" onPress={() => openDocument(guestUrl)} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  welcome: { lineHeight: 23, marginBottom: 12 },
  top: {},
  topBar: { position: 'absolute', top: 0, right: 0, height: TAB_HEADER_HEIGHT, justifyContent: 'center' },
  brand: { alignItems: 'center', gap: Spacing.sm, paddingHorizontal: 48 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  inlineTitle: { flex: 1 },
  cardTitle: { marginTop: Spacing.sm, marginBottom: Spacing.xs },
  cardAction: { marginTop: Spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xxs },
  play: { width: 40, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
