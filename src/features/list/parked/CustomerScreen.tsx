import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { customers } from '@/data/mock';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

export default function CustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customer = customers.find((c) => c.id === id);
  const { colors } = useTheme();

  if (!customer) {
    return (
      <Screen>
        <Text color="textSecondary">Customer not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <Text variant="title1">{customer.name}</Text>
      <View style={styles.pills}>
        <Pill label={customer.cnaCompleted ? 'CNA done' : 'CNA pending'} color={customer.cnaCompleted ? colors.success : colors.textSecondary} />
        <Pill label={customer.thankYouSent ? 'Thank-you sent' : 'Thank-you due'} color={customer.thankYouSent ? colors.success : colors.warning} />
        <Pill label={customer.channel} />
      </View>

      <Section title="PRODUCTS ORDERED" items={customer.productsOrdered} empty="Nothing ordered yet." />
      <Section title="SAMPLES GIVEN" items={customer.samples} empty="No samples given." />

      <Card>
        <Text variant="footnote" color="textSecondary" style={styles.label}>
          NEXT STEPS
        </Text>
        <Text variant="body">{customer.nextSteps || '—'}</Text>
        {customer.notes ? (
          <Text variant="subheadline" color="textSecondary" style={styles.notes}>
            {customer.notes}
          </Text>
        ) : null}
      </Card>

      <View style={styles.actions}>
        <Button label="Log order" icon="add" />
        <Button label="Mark thank-you sent" icon="check" variant="glass" disabled={customer.thankYouSent} />
      </View>
    </Screen>
  );
}

function Section({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <Card>
      <Text variant="footnote" color="textSecondary" style={styles.label}>
        {title}
      </Text>
      {items.length ? (
        items.map((item) => (
          <Text key={item} variant="body" style={styles.item}>
            • {item}
          </Text>
        ))
      ) : (
        <Text variant="body" color="textTertiary">
          {empty}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  label: { letterSpacing: 0.6, marginBottom: Spacing.sm },
  item: { paddingVertical: 2 },
  notes: { marginTop: Spacing.sm },
  actions: { gap: Spacing.sm },
});
