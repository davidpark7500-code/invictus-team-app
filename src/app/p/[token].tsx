import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import type { Profile } from '@/data/types';
import { InlineVideo } from '@/features/media/InlineVideo';
import { PhotoGallery } from '@/features/profiles/PhotoGallery';
import { pinLabel, ProfileAvatar } from '@/features/profiles/ProfileAvatar';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

type SharedRow = {
  first_names: string;
  last_name: string;
  pin: string;
  founders: boolean;
  qualifying: boolean;
  bio: string;
  photo_url: string | null;
  photos: string[] | null;
  video_url: string | null;
  expires_at: string;
};

type State = { status: 'loading' } | { status: 'gone' } | { status: 'ready'; profile: Profile; expiresAt: string };

/**
 * A team profile shared with a prospect: /p/<token>. Opens without an account, outside
 * the tabs, and only while the link is live (7 days, unless an admin turns it off).
 */
export default function SharedProfilePage() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { colors } = useTheme();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supabase || !token) {
        if (!cancelled) setState({ status: 'gone' });
        return;
      }
      const { data, error } = await supabase.rpc('shared_profile_page', { share_token: token });
      const row = (data as SharedRow[] | null)?.[0];
      if (cancelled) return;
      if (error || !row) {
        setState({ status: 'gone' });
        return;
      }
      setState({
        status: 'ready',
        expiresAt: row.expires_at,
        profile: {
          id: token,
          firstNames: row.first_names,
          lastName: row.last_name,
          pin: row.pin,
          founders: row.founders,
          qualifying: row.qualifying,
          bio: row.bio || undefined,
          photoUrl: row.photos?.[0] ?? row.photo_url ?? undefined,
          photos: row.photos?.length ? row.photos : row.photo_url ? [row.photo_url] : [],
          videoUrl: row.video_url ?? undefined,
        },
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Screen contentContainerStyle={styles.content} playerInset={false}>
      <Head>
        <title>Invictus Team</title>
        {/* Private links: keep them out of search engines. */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <View style={styles.brand}>
        <BrandLogo width={120} />
      </View>

      {state.status === 'loading' ? (
        <ActivityIndicator color={colors.textSecondary} style={styles.loading} />
      ) : state.status === 'gone' ? (
        <Card>
          <Text variant="headline">This link has expired</Text>
          <Text variant="body" color="textSecondary" style={styles.gap}>
            Shared profiles are open for 7 days. Ask the person who sent it for a new link.
          </Text>
        </Card>
      ) : (
        <>
          {state.profile.photos?.length ? (
            <PhotoGallery photos={state.profile.photos} name={`${state.profile.firstNames} ${state.profile.lastName}`} />
          ) : null}
          <View style={styles.hero}>
            {state.profile.photos?.length ? null : <ProfileAvatar profile={state.profile} size={128} />}
            <Text variant="title1" style={styles.center}>
              {state.profile.firstNames} {state.profile.lastName}
            </Text>
            <Pill label={pinLabel(state.profile)} />
          </View>

          {state.profile.videoUrl ? (
            <InlineVideo
              url={state.profile.videoUrl}
              title={`${state.profile.firstNames} ${state.profile.lastName}`}
            />
          ) : null}

          {state.profile.bio ? (
            <Card>
              {state.profile.bio.split(/\n\s*\n/).map((para) => (
                <Text key={para.slice(0, 24)} variant="body" style={styles.para}>
                  {para.trim()}
                </Text>
              ))}
            </Card>
          ) : null}

          <Text variant="caption" color="textTertiary" style={styles.center}>
            Shared by the Invictus Team · link open until{' '}
            {new Date(state.expiresAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
          </Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.xxl },
  brand: { alignItems: 'center', marginBottom: Spacing.sm },
  loading: { marginTop: Spacing.xxl },
  hero: { alignItems: 'center', gap: Spacing.sm },
  center: { textAlign: 'center' },
  gap: { marginTop: Spacing.xs },
  para: { lineHeight: 23, marginBottom: Spacing.sm },
});
