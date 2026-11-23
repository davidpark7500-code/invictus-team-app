import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TabHeader } from '@/components/ui/TabHeader';
import { useContent } from '@/data/content';
import { KIND_ICON, KIND_LABEL } from '@/features/resources/kinds';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

/** Section order follows the order items appear in the data. */

export default function ResourcesScreen() {
  const { resources } = useContent();
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = q
      ? resources.filter((r) => `${r.title} ${r.speaker ?? ''} ${r.section}`.toLowerCase().includes(q))
      : resources;
    const sections = [...new Set(resources.map((r) => r.section))];
    return sections.map((s) => [s, items.filter((r) => r.section === s)] as const).filter(([, list]) => list.length);
  }, [query, resources]);

  return (
    <Screen tabRoot keyboardShouldPersistTaps="handled">
      <TabHeader title="Resources" />
      <View style={[styles.search, { backgroundColor: colors.fill }]}>
        <Icon name="search" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search resources"
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
          accessibilityLabel="Search resources"
        />
      </View>
      {grouped.map(([section, list]) => (
        <View key={section} style={styles.group}>
          <SectionHeader title={section} />
          {list.map((r) => (
            <ListRow
              key={r.id}
              icon={KIND_ICON[r.kind]}
              title={r.title}
              subtitle={r.speaker}
              meta={KIND_LABEL[r.kind]}
              onPress={() => router.push(`/resources/${r.id}`)}
            />
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 12 },
  search: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, height: 44, borderRadius: Radius.input, paddingHorizontal: Spacing.md },
  searchInput: { flex: 1, height: '100%', fontSize: 17 },
});
