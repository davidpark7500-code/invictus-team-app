import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useContent } from '@/data/content';
import { InlineVideo } from '@/features/media/InlineVideo';
import { pinLabel, ProfileAvatar } from '@/features/profiles/ProfileAvatar';
import { type ShareResult, shareProfile } from '@/features/profiles/shareProfile';
import { useAuth } from '@/lib/AuthProvider';
import { Spacing } from '@/theme/tokens';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profiles } = useContent();
  const profile = profiles.find((p) => p.id === id);
  const { demoMode } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [result, setResult] = useState<ShareResult | null>(null);

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

      <Button
        label="Share with a prospect"
        icon="share"
        variant="glass"
        loading={sharing}
        disabled={demoMode}
        onPress={async () => {
          setSharing(true);
          setResult(await shareProfile(profile));
          setSharing(false);
        }}
      />
      <Text variant="caption" color={result === 'error' ? 'danger' : 'textTertiary'} style={styles.center}>
        {SHARE_NOTE[result ?? 'idle']}
      </Text>
    </Screen>
  );
}

const SHARE_NOTE: Record<ShareResult | 'idle', string> = {
  idle: 'Sends a private link to this profile. It works for 7 days, no app or account needed.',
  shared: 'Link sent. It works for 7 days.',
  copied: 'Link copied. Paste it into a text or email; it works for 7 days.',
  'not-configured': 'Sharing works once the app is connected to its server.',
  error: 'Couldn\u2019t make a link. Check your connection and try again.',
};

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  hero: { alignItems: 'center', gap: Spacing.sm },
  center: { textAlign: 'center' },
});
