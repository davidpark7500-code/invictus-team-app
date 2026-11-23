import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { TeamHero } from '@/features/home/TeamHero';
import { eventDay, formatEventPlace, formatEventWhen, formatRelativeDay, greeting, isUpcoming } from '@/data/format';
import { events, resources, WELCOME } from '@/data/mock';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const nextEvent = events.filter((e) => isUpcoming(e)).sort((a, b) => a.date.localeCompare(b.date))[0];
  const talks = resources.filter((r) => r.section === 'Onboarding Talks');

  return (
    <Screen>
      <View style={styles.brand}>
        <BrandLogo width={150} />
        <Text variant="title3" color="textSecondary">
          {greeting()}
        </Text>
      </View>

      <TeamHero />

      <Card>
        {WELCOME.map((para) => (
          <Text key={para.slice(0, 16)} variant="callout" style={styles.welcome}>
            {para}
          </Text>
        ))}
      </Card>

      {nextEvent ? (
        <Card onPress={() => router.push(`/events/${nextEvent.id}`)} tintColor={colors.brandSoft}>
          <View style={styles.cardHead}>
            <Pill label="Next up" filled color={colors.brand} textColor={colors.onBrand} />
            <Text variant="caption" color="textSecondary">
              {formatRelativeDay(eventDay(nextEvent))}
            </Text>
          </View>
          <Text variant="title2" style={styles.cardTitle}>
            {nextEvent.title}
          </Text>
          <View style={styles.metaRow}>
            <Icon name="clock" size={14} color={colors.textSecondary} />
            <Text variant="subheadline" color="textSecondary">
              {formatEventWhen(nextEvent)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Icon name={nextEvent.isVirtual ? 'video' : 'pin'} size={14} color={colors.textSecondary} />
            <Text variant="subheadline" color="textSecondary">
              {formatEventPlace(nextEvent)}
            </Text>
          </View>
        </Card>
      ) : null}

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

const styles = StyleSheet.create({
  welcome: { lineHeight: 23, marginBottom: 12 },
  brand: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  inlineTitle: { flex: 1 },
  cardTitle: { marginTop: Spacing.sm, marginBottom: Spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xxs },
  play: { width: 40, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
