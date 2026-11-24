import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useContent } from '@/data/content';
import type { Profile } from '@/data/types';
import { Icon } from '@/components/ui/Icon';
import { pickAndUploadPhotos, type ProfileEdits, saveProfile } from '@/features/profiles/editProfile';
import { pinLabel, ProfileAvatar } from '@/features/profiles/ProfileAvatar';
import { useAuth } from '@/lib/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';


/**
 * Admins edit a team profile here: photo, names, pin and bio. Saved changes go
 * to the database, and everyone sees them the next time they open the app.
 */
export default function EditProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profiles } = useContent();
  const { role } = useAuth();
  const profile = profiles.find((p) => p.id === id);

  if (role !== 'admin') {
    return (
      <Screen>
        <Text color="textSecondary">Only admins can edit profiles.</Text>
      </Screen>
    );
  }
  if (!profile) {
    return (
      <Screen>
        <Text color="textSecondary">Profile not found.</Text>
      </Screen>
    );
  }
  return <Editor key={profile.id} profile={profile} />;
}

function Editor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { refresh } = useContent();
  const [edits, setEdits] = useState<ProfileEdits>({
    first_names: profile.firstNames,
    last_name: profile.lastName,
    // One line of text: "Founders Ruby Qual". Founders and Qual live in the text from now on.
    pin: pinLabel(profile),
    founders: false,
    qualifying: false,
    bio: profile.bio ?? '',
    photos: profile.photos ?? (profile.photoUrl ? [profile.photoUrl] : []),
  });
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const set = <K extends keyof ProfileEdits>(key: K, value: ProfileEdits[K]) => setEdits((e) => ({ ...e, [key]: value }));
  const field = [styles.input, { color: colors.text, backgroundColor: colors.fill }];
  const preview: Profile = { ...profile, lastName: edits.last_name || profile.lastName, photoUrl: edits.photos[0] };
  const move = (from: number, to: number) => {
    const next = edits.photos.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    set('photos', next);
  };

  return (
    <Screen contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Edit profile' }} />

      <View style={styles.photo}>
        <ProfileAvatar profile={preview} size={96} />
        <Text variant="footnote" color="textSecondary" style={styles.center}>
          The first photo is the main one: it shows in the Profiles list. Everyone can swipe through the rest on the profile.
        </Text>
      </View>

      <Label text={`Photos (${edits.photos.length})`} />
      {edits.photos.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
          {edits.photos.map((uri, i) => (
            <View key={uri} style={styles.thumbWrap}>
              <Image source={{ uri }} style={[styles.thumb, i === 0 && { borderColor: colors.brand, borderWidth: 2 }]} contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${i + 1}`}
                hitSlop={6}
                onPress={() => set('photos', edits.photos.filter((_, j) => j !== i))}
                style={styles.remove}>
                <Icon name="close" size={12} color="#FFFFFF" />
              </Pressable>
              {i === 0 ? (
                <Text variant="caption" color="brandText" style={styles.thumbNote}>
                  Main
                </Text>
              ) : (
                <View style={styles.thumbActions}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Make photo ${i + 1} the main photo`} onPress={() => move(i, 0)}>
                    <Text variant="caption" color="textSecondary" style={styles.thumbNote}>
                      Make main
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      ) : null}
      <Button
        label={uploading ?? (edits.photos.length ? 'Add more photos' : 'Add photos')}
        icon="photo"
        variant="glass"
        loading={!!uploading}
        onPress={async () => {
          setMessage(null);
          setUploading('Uploading…');
          const result = await pickAndUploadPhotos(profile.id, (done, total) => setUploading(`Uploading ${Math.min(done + 1, total)} of ${total}…`));
          setUploading(null);
          if (result.error) setMessage(result.error);
          if (result.uploaded.length) setEdits((e) => ({ ...e, photos: [...e.photos, ...result.uploaded] }));
          if (result.failed) setMessage(`${result.failed} photo${result.failed > 1 ? 's' : ''} couldn\u2019t be added. Try those again.`);
        }}
      />

      <Label text="First names" />
      <TextInput
        style={field}
        value={edits.first_names}
        onChangeText={(v) => set('first_names', v)}
        placeholder="Paul and Morgan"
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="words"
      />
      <Label text="Last name" />
      <TextInput
        style={field}
        value={edits.last_name}
        onChangeText={(v) => set('last_name', v)}
        placeholder="Kopecky"
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="words"
      />

      <Label text="Pin" />
      <TextInput
        style={field}
        value={edits.pin}
        onChangeText={(v) => set('pin', v)}
        placeholder="Founders Emerald"
        placeholderTextColor={colors.textTertiary}
        autoCapitalize="words"
      />
      <Text variant="caption" color="textTertiary" style={styles.hint}>
        Shown exactly as typed, for example “Founders Ruby Qual”.
      </Text>

      <Label text="Bio" />
      <TextInput
        style={[field, styles.bio]}
        value={edits.bio}
        onChangeText={(v) => set('bio', v)}
        placeholder="A few lines about them. Leave a blank line between paragraphs."
        placeholderTextColor={colors.textTertiary}
        multiline
        textAlignVertical="top"
      />

      {message ? (
        <Text variant="footnote" color="danger">
          {message}
        </Text>
      ) : null}
      <Button
        label="Save"
        icon="check"
        loading={saving}
        disabled={!!uploading || !edits.first_names.trim() || !edits.last_name.trim()}
        onPress={async () => {
          setSaving(true);
          setMessage(null);
          const error = await saveProfile(profile.id, {
            ...edits,
            first_names: edits.first_names.trim(),
            last_name: edits.last_name.trim(),
            pin: edits.pin.trim(),
            bio: edits.bio.trim(),
          });
          if (error) {
            setSaving(false);
            setMessage(error);
            return;
          }
          await refresh();
          setSaving(false);
          router.back();
        }}
      />
      <Text variant="caption" color="textTertiary" style={styles.center}>
        Everyone sees your changes the next time they open the app.
      </Text>
    </Screen>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text variant="footnote" color="textSecondary" style={styles.label}>
      {text.toUpperCase()}
    </Text>
  );
}


const styles = StyleSheet.create({
  content: { paddingTop: Spacing.lg },
  photo: { alignItems: 'center', gap: Spacing.sm },
  thumbs: { gap: Spacing.md, paddingVertical: Spacing.xs },
  thumbWrap: { width: 96, alignItems: 'center', gap: 4 },
  thumb: { width: 96, height: 96, borderRadius: Radius.md },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  thumbActions: { alignItems: 'center' },
  thumbNote: { textAlign: 'center' },
  label: { paddingHorizontal: Spacing.xs, marginBottom: -Spacing.sm, letterSpacing: 0.6 },
  input: { minHeight: 48, borderRadius: Radius.input, paddingHorizontal: Spacing.lg, fontSize: 17 },
  bio: { minHeight: 200, paddingTop: Spacing.md, paddingBottom: Spacing.md, lineHeight: 22 },
  center: { textAlign: 'center' },
  hint: { paddingHorizontal: Spacing.xs, marginTop: -Spacing.sm },
});
