import { useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { Glass, GlassGroup } from '@/components/glass/Glass';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useAccount } from '@/features/account/useAccount';
import { NotificationSettings } from '@/features/account/NotificationSettings';
import { useAuth } from '@/lib/AuthProvider';
import { type ThemePreference, useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

const options: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: 'system', label: 'System', icon: 'auto' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
];

/** Everything personal in one place, opened from the account button on every tab. */
export default function AccountScreen() {
  const { preference, setPreference, colors, reduceTransparency } = useTheme();
  const { demoMode, role, signOut } = useAuth();
  const { name, initials, email } = useAccount();
  const router = useRouter();

  return (
    <Screen playerInset={false} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="title1">Account</Text>
        {Platform.OS === 'web' ? <Button label="Close" variant="quiet" onPress={() => router.back()} /> : null}
      </View>

      <Card>
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: colors.brandSoft }]}>
            <Text style={[styles.avatarText, { color: colors.brandText }]}>{initials}</Text>
          </View>
          <View style={styles.profileText}>
            <Text variant="headline" numberOfLines={1}>
              {name}
            </Text>
            <Text variant="subheadline" color="textSecondary" numberOfLines={2}>
              {demoMode
                ? 'Demo mode \u00b7 sample data'
                : [email, role === 'admin' ? 'Admin' : 'Team member'].filter(Boolean).join(' \u00b7 ')}
            </Text>
          </View>
        </View>
      </Card>

      <Text variant="footnote" color="textSecondary" style={styles.label}>
        NOTIFICATIONS
      </Text>
      <Card>
        <NotificationSettings />
      </Card>

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
                tintColor={selected ? colors.brandSoft : undefined}
                style={[styles.segmentInner, selected && { borderColor: colors.brand, borderWidth: 1 }]}>
                <Icon name={opt.icon} size={20} color={selected ? colors.brandText : colors.textSecondary} />
                <Text variant="subheadline" color={selected ? 'brandText' : 'textSecondary'}>
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

      {!demoMode ? (
        <Card>
          <Button label="Sign out" icon="signOut" variant="quiet" onPress={signOut} />
        </Card>
      ) : null}

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
  profile: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  profileText: { flex: 1, gap: 2 },
  about: { textAlign: 'center', marginTop: Spacing.lg },
});
