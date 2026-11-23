import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TabHeader } from '@/components/ui/TabHeader';
import { useContent } from '@/data/content';
import { pinLabel, ProfileAvatar } from '@/features/profiles/ProfileAvatar';
import { Spacing } from '@/theme/tokens';

/** Pin levels, highest first, as the current app orders them. */
const PINS = ['EDC', 'Emerald', 'Sapphire', 'Ruby', 'Platinum'];

export default function ProfilesScreen() {
  const { profiles } = useContent();
  const router = useRouter();
  return (
    <Screen tabRoot>
      <TabHeader title="Profiles" />
      {PINS.map((pin) => {
        const list = profiles.filter((p) => p.pin === pin);
        if (!list.length) return null;
        return (
          <View key={pin} style={styles.group}>
            <SectionHeader title={pin} />
            {list.map((p) => (
              <ListRow
                key={p.id}
                leading={<ProfileAvatar profile={p} size={48} />}
                title={`${p.firstNames} ${p.lastName}`}
                subtitle={pinLabel(p)}
                meta={p.videoSource ? 'Video' : undefined}
                onPress={() => router.push(`/profiles/${p.id}`)}
              />
            ))}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({ group: { gap: Spacing.md } });
