import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { TabHeader } from '@/components/ui/TabHeader';
import { useContent } from '@/data/content';
import { pinLabel, ProfileAvatar } from '@/features/profiles/ProfileAvatar';
import { Spacing } from '@/theme/tokens';

/** One list in the team's own order (team_profiles.sort_order), each with their pin. */
export default function ProfilesScreen() {
  const { profiles } = useContent();
  const router = useRouter();
  return (
    <Screen tabRoot>
      <TabHeader title="Profiles" />
      <View style={styles.list}>
        {profiles.map((p) => (
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
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { gap: Spacing.md } });
