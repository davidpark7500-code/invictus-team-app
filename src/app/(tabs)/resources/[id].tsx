import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { formatDate } from '@/data/format';
import { resources } from '@/data/mock';
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
      <View style={[styles.hero, { backgroundColor: colors.accentSoft }]}>
        <Icon name={resource.kind === 'pdf' ? 'pdf' : resource.kind === 'video' ? 'video' : 'link'} size={44} color={colors.accent} />
      </View>
      <Pill label={resource.category} />
      <Text variant="title1">{resource.title}</Text>
      <Text variant="body" color="textSecondary">
        {resource.summary}
      </Text>
      <Text variant="footnote" color="textTertiary">
        Updated {formatDate(resource.updatedAt, { month: 'long', day: 'numeric', year: 'numeric' })}
      </Text>
      <Card>
        <View style={styles.actions}>
          <Button label={resource.kind === 'link' ? 'Open' : 'View'} icon={resource.kind === 'link' ? 'link' : 'pdf'} />
          <Button label="Share" icon="share" variant="glass" />
          {resource.kind === 'pdf' ? <Button label="Save offline" icon="download" variant="quiet" /> : null}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  hero: { width: 96, height: 96, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: Spacing.sm },
});
