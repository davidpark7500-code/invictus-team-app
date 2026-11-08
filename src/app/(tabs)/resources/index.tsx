import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { resources } from '@/data/mock';
import { KIND_ICON, KIND_LABEL } from '@/features/resources/kinds';

/** Section order follows the order items appear in the data. */
const SECTIONS = [...new Set(resources.map((r) => r.section))];

export default function ResourcesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = q
      ? resources.filter((r) => `${r.title} ${r.speaker ?? ''} ${r.section}`.toLowerCase().includes(q))
      : resources;
    return SECTIONS.map((s) => [s, items.filter((r) => r.section === s)] as const).filter(([, list]) => list.length);
  }, [query]);

  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: 'Search resources',
            onChangeText: (e) => setQuery(e.nativeEvent.text),
            hideWhenScrolling: true,
          },
        }}
      />
      <Screen>
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
    </>
  );
}

const styles = StyleSheet.create({ group: { gap: 12 } });
