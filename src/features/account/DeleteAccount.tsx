import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

const WARNING =
  'This permanently deletes your account, your name and photo, and every sale you’ve logged, so you’ll drop off the Leaderboard. It can’t be undone.';

/** Required by the App Store and Google Play: anyone can delete their own account from inside the app. */
export function DeleteAccount() {
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { data } = await supabase.auth.getUser();
    const id = data.user?.id;
    if (id) {
      // Profile photos live in avatars/<user id>/; storage files can't be removed from the database side.
      const { data: files } = await supabase.storage.from('avatars').list(id);
      if (files?.length) await supabase.storage.from('avatars').remove(files.map((f) => `${id}/${f.name}`));
    }
    const { error: rpcError } = await supabase.rpc('delete_my_account');
    if (rpcError) {
      setBusy(false);
      setError(/network|fetch/i.test(rpcError.message) ? 'No connection. Try again in a moment.' : 'Couldn’t delete your account. Try again.');
      return;
    }
    await signOut();
  }

  function confirm() {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete your account?\n\n${WARNING}`)) remove();
      return;
    }
    Alert.alert('Delete your account?', WARNING, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete account', style: 'destructive', onPress: remove },
    ]);
  }

  return (
    <View style={styles.wrap}>
      <Pressable onPress={confirm} disabled={busy} accessibilityRole="button" style={styles.row}>
        {busy ? <ActivityIndicator color={colors.danger} /> : <Icon name="trash" size={16} color={colors.danger} />}
        <Text variant="headline" style={{ color: colors.danger }}>
          {busy ? 'Deleting…' : 'Delete account'}
        </Text>
      </Pressable>
      {error ? (
        <Text variant="footnote" style={[styles.center, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  center: { textAlign: 'center' },
});
