import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Glass } from '@/components/glass/Glass';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/lib/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { MaxContentWidth, Radius, Spacing } from '@/theme/tokens';
import { ScreenGlow } from '@/features/leaderboard/GlowBackground';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signingUp = mode === 'sign-up';
  const ready = signingUp
    ? fullName.trim() && email.trim() && password.length >= 8 && teamCode.trim()
    : email.trim() && password;

  async function submit() {
    if (!ready || busy) return;
    setBusy(true);
    setError(signingUp ? await signUp({ fullName, email, password, teamCode }) : await signIn(email, password));
    setBusy(false);
  }

  const field = [styles.input, { color: colors.text, backgroundColor: colors.fill }];
  const placeholder = colors.textTertiary;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenGlow />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>
            <View style={styles.hero}>
              <BrandLogo width={220} style={styles.logo} />
              <Text variant="subheadline" color="textSecondary" style={styles.centerText}>
                {signingUp
                  ? 'Create your account. You’ll need the team code from your upline.'
                  : 'On Pulse Board? Sign in with the same email and password you use there.'}
              </Text>
            </View>

            <Glass radius={Radius.xl} style={styles.form}>
              {signingUp ? (
                <>
                  <TextInput
                    style={field}
                    placeholder="Name (e.g. David & Samantha Park)"
                    placeholderTextColor={placeholder}
                    autoCapitalize="words"
                    textContentType="name"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                  <Text variant="caption" color="textTertiary" style={styles.hint}>
                    Couples share one account: both first names and your last name.
                  </Text>
                </>
              ) : null}
              <TextInput
                style={field}
                placeholder="Email"
                placeholderTextColor={placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                textContentType={signingUp ? 'emailAddress' : 'username'}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={field}
                placeholder={signingUp ? 'Password (8+ characters)' : 'Password'}
                placeholderTextColor={placeholder}
                secureTextEntry
                textContentType={signingUp ? 'newPassword' : 'password'}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={submit}
              />
              {signingUp ? (
                <TextInput
                  style={field}
                  placeholder="Team code"
                  placeholderTextColor={placeholder}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  value={teamCode}
                  onChangeText={setTeamCode}
                  onSubmitEditing={submit}
                />
              ) : null}
              {error ? (
                <Text variant="footnote" style={{ color: colors.danger }}>
                  {error}
                </Text>
              ) : null}
              <Button
                label={signingUp ? 'Create account' : 'Sign in'}
                onPress={submit}
                loading={busy}
                disabled={!ready}
              />
            </Glass>

            <Pressable
              onPress={() => {
                setMode(signingUp ? 'sign-in' : 'sign-up');
                setError(null);
              }}
              hitSlop={8}>
              <Text variant="subheadline" color="textSecondary" style={styles.centerText}>
                {signingUp ? 'Already have an account? ' : 'New to the team? '}
                <Text variant="subheadline" style={{ color: colors.brandText, fontWeight: '600' }}>
                  {signingUp ? 'Sign in' : 'Create an account'}
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  column: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.xl },
  hero: { alignItems: 'center', gap: Spacing.sm },
  logo: { marginBottom: Spacing.md },
  centerText: { textAlign: 'center' },
  form: { padding: Spacing.lg, gap: Spacing.md },
  hint: { marginTop: -Spacing.xs, paddingHorizontal: Spacing.xs },
  input: { height: 48, borderRadius: Radius.input, paddingHorizontal: Spacing.lg, fontSize: 17 },
});
