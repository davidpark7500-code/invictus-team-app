import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glass } from '@/components/glass/Glass';
import { Button } from '@/components/ui/Button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/lib/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { MaxContentWidth, Radius, Spacing } from '@/theme/tokens';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(await signIn(username, password));
    setBusy(false);
  }

  const field = [styles.input, { color: colors.text, backgroundColor: colors.fill }];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <View style={styles.column}>
          <View style={styles.hero}>
            <BrandLogo width={240} style={styles.logo} />
            <Text variant="subheadline" color="textSecondary">
              Team access only. Ask your leader for the team login.
            </Text>
          </View>

          <Glass radius={Radius.xl} style={styles.form}>
            <TextInput
              style={field}
              placeholder="Username"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              value={username}
              onChangeText={setUsername}
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
            <Button label="Sign in" onPress={submit} loading={busy} disabled={!username || !password} />
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
  logo: { marginBottom: Spacing.md },
  form: { padding: Spacing.lg, gap: Spacing.md },
  input: { height: 48, borderRadius: Radius.sm, paddingHorizontal: Spacing.lg, fontSize: 17 },
});
