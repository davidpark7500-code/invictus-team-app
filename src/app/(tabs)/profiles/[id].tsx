import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useContent } from '@/data/content';
import { InlineVideo } from '@/features/media/InlineVideo';
import { pinLabel, ProfileAvatar } from '@/features/profiles/ProfileAvatar';
import { Spacing } from '@/theme/tokens';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profiles } = useContent();
  const profile = profiles.find((p) => p.id === id);

  if (!profile) {
    return (
      <Screen>
        <Text color="textSecondary">Profile not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <ProfileAvatar profile={profile} size={128} />
        <Text variant="title1" style={styles.center}>
          {profile.firstNames} {profile.lastName}
        </Text>
        <Pill label={pinLabel(profile)} />
      </View>

      {profile.videoSource ? (
        <InlineVideo
          url={profile.videoUrl}
          title={`${profile.firstNames} ${profile.lastName}`}
          pendingLabel="Profile video link not connected yet."
        />
      ) : null}

      <Card>
        <Text variant="body" color={profile.bio ? 'text' : 'textTertiary'}>
          {profile.bio ?? 'Bio coming soon.'}
        </Text>
      </Card>

      <Button label="Share with a prospect" icon="share" variant="glass" disabled />
      <Text variant="caption" color="textTertiary" style={styles.center}>
        Sends a private link to this profile that expires after 7 days. Available once the backend is live.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  hero: { alignItems: 'center', gap: Spacing.sm },
  center: { textAlign: 'center' },
});
