import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { formatDate } from '@/data/format';
import { resources } from '@/data/mock';
import type { ResourceCategory, ResourceKind } from '@/data/types';

const ORDER: ResourceCategory[] = ['CNA', 'Roadmap', 'Plan', 'Training', 'Forms'];
const KIND_ICON: Record<ResourceKind, 'pdf' | 'link' | 'video'> = { pdf: 'pdf', link: 'link', video: 'video' };

export default function ResourcesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = q ? resources.filter((r) => `${r.title} ${r.summary}`.toLowerCase().includes(q)) : resources;
    return ORDER.map((cat) => [cat, items.filter((r) => r.category === cat)] as const).filter(([, list]) => list.length);
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
        {grouped.map(([cat, list]) => (
          <View key={cat} style={styles.group}>
            <SectionHeader title={cat} />
            {list.map((r) => (
              <ListRow
                key={r.id}
                icon={KIND_ICON[r.kind]}
                title={r.title}
                subtitle={r.summary}
                meta={`Updated ${formatDate(r.updatedAt)}`}
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
