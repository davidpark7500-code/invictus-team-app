import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glass } from '@/components/glass/Glass';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/lib/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { MaxContentWidth, Radius, Spacing } from '@/theme/tokens';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(await signIn(email.trim(), password));
    setBusy(false);
  }

  const field = [styles.input, { color: colors.text, backgroundColor: colors.fill }];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <View style={styles.column}>
          <View style={styles.hero}>
            <View style={[styles.mark, { backgroundColor: colors.accent }]}>
              <Icon name="sparkles" size={28} color={colors.onAccent} />
            </View>
            <Text variant="largeTitle">Invictus</Text>
            <Text variant="subheadline" color="textSecondary">
              Team access only. Use the email your leader invited.
            </Text>
          </View>

          <Glass radius={Radius.xl} style={styles.form}>
            <TextInput
              style={field}
              placeholder="Email"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="username"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={field}
              placeholder="Password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submit}
            />
            {error ? (
              <Text variant="footnote" style={{ color: colors.danger }}>
                {error}
              </Text>
            ) : null}
            <Button label="Sign in" onPress={submit} loading={busy} disabled={!email || !password} />
          </Glass>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  column: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.xl },
  hero: { alignItems: 'center', gap: Spacing.sm },
  mark: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  form: { padding: Spacing.lg, gap: Spacing.md },
  input: { height: 48, borderRadius: Radius.sm, paddingHorizontal: Spacing.lg, fontSize: 17 },
});
