import { useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { Glass, GlassGroup } from '@/components/glass/Glass';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/lib/AuthProvider';
import { type ThemePreference, useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

const options: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'system', label: 'System', icon: 'auto' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
];

export default function SettingsScreen() {
  const { preference, setPreference, colors, reduceTransparency } = useTheme();
  const { demoMode, role, signOut } = useAuth();
  const router = useRouter();

  return (
    <Screen playerInset={false} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="title1">Settings</Text>
        {Platform.OS === 'web' ? <Button label="Close" variant="quiet" onPress={() => router.back()} /> : null}
      </View>

      <Text variant="footnote" color="textSecondary" style={styles.label}>
        APPEARANCE
      </Text>
      <GlassGroup spacing={8} style={styles.segment}>
        {options.map((opt) => {
          const selected = preference === opt.value;
          return (
            <Pressable key={opt.value} onPress={() => setPreference(opt.value)} style={styles.segmentItem}>
              <Glass
                interactive
                radius={Radius.md}
                tintColor={selected ? colors.accentSoft : undefined}
                style={[styles.segmentInner, selected && { borderColor: colors.accent, borderWidth: 1 }]}>
                <Icon name={opt.icon} size={20} color={selected ? colors.accent : colors.textSecondary} />
                <Text variant="subheadline" color={selected ? 'accent' : 'textSecondary'}>
                  {opt.label}
                </Text>
              </Glass>
            </Pressable>
          );
        })}
      </GlassGroup>
      {reduceTransparency ? (
        <Text variant="caption" color="textTertiary">
          Reduce Transparency is on, so glass surfaces are shown solid.
        </Text>
      ) : null}

      <Text variant="footnote" color="textSecondary" style={styles.label}>
        ACCOUNT
      </Text>
      <Card>
        <Text variant="headline">{demoMode ? 'Demo mode' : role === 'admin' ? 'Admin' : 'Team account'}</Text>
        <Text variant="subheadline" color="textSecondary">
          {demoMode
            ? 'No Supabase project configured. Showing placeholder content.'
            : role === 'admin'
              ? 'Signed in as admin. You can manage content.'
              : 'Signed in with the shared team login.'}
        </Text>
        {!demoMode ? (
          <View style={styles.signOut}>
            <Button label="Sign out" icon="signOut" variant="quiet" onPress={signOut} />
          </View>
        ) : null}
      </Card>

      <Text variant="caption" color="textTertiary" style={styles.about}>
        Invictus Team · 0.1.0
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: Spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { paddingHorizontal: Spacing.xs, marginBottom: -Spacing.sm, letterSpacing: 0.6 },
  segment: { flexDirection: 'row', gap: Spacing.sm },
  segmentItem: { flex: 1 },
  segmentInner: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
  signOut: { marginTop: Spacing.md, alignSelf: 'flex-start' },
  about: { textAlign: 'center', marginTop: Spacing.lg },
});
