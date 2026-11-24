import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@/components/glass/Glass';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

const MAX = 60;

/** Changes how someone shows up on the Leaderboard and in sale alerts, e.g. to add a partner. */
export function EditNameSheet({ open, onClose, current }: { open: boolean; onClose: () => void; current: string }) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* Mounted fresh on each open, so it always starts from the saved name. */}
      {open ? <Sheet onClose={onClose} current={current} /> : null}
    </Modal>
  );
}

function Sheet({ onClose, current }: { onClose: () => void; current: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const clean = name.replace(/\s+/g, ' ').trim();
  const changed = clean.length > 0 && clean !== current;

  async function save() {
    if (!supabase || !changed) return;
    setSaving(true);
    setError(null);
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    const { error: profileError } = userId
      ? await supabase.from('profiles').update({ full_name: clean }).eq('id', userId)
      : { error: { message: 'Not signed in.' } };
    // The account screen reads the name from the sign-in record, so keep that in step too.
    const { error: authError } = profileError ? { error: null } : await supabase.auth.updateUser({ data: { full_name: clean } });
    setSaving(false);
    const failed = profileError ?? authError;
    if (failed) setError(/network|fetch/i.test(failed.message) ? 'No connection. Try again in a moment.' : 'Couldn’t save that. Try again.');
    else onClose();
  }

  return (
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      <Glass radius={30} tintColor={colors.backgroundElevated} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <View style={styles.copy}>
          <Text variant="title2">Edit your name</Text>
          <Text variant="subheadline" color="textSecondary">
            This is how you show up on the Leaderboard and in sale alerts. Selling as a couple? Put both names, like “Sam & Alex Smith”.
          </Text>
        </View>

        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={MAX}
          autoFocus
          selectTextOnFocus
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          autoComplete="name"
          returnKeyType="done"
          onSubmitEditing={save}
          editable={!saving}
          accessibilityLabel="Name"
          style={[styles.input, { color: colors.text, backgroundColor: colors.fill }]}
        />

        {error ? (
          <Text variant="footnote" style={{ color: colors.danger }}>
            {error}
          </Text>
        ) : null}

        <Button label="Save name" onPress={save} disabled={!changed} loading={saving} />
        <Button label="Cancel" variant="quiet" onPress={onClose} disabled={saving} />
      </Glass>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  copy: { gap: Spacing.xs, marginBottom: Spacing.xs },
  input: { height: 50, borderRadius: Radius.input, paddingHorizontal: Spacing.lg, fontSize: 17 },
});
