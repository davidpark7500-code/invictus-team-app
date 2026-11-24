import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

import { useAccount } from './useAccount';

/**
 * The one account button, top right on every tab: the person's initials.
 * Opens the Account sheet (profile, notifications, appearance, sign out).
 */
export function AccountButton() {
  const { colors } = useTheme();
  const { initials, name } = useAccount();
  const router = useRouter();
  // Opens the sheet itself rather than through a Link wrapper, so nothing between
  // the tap and the navigation can swallow it.
  return (
    <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel={`Account, ${name}`} onPress={() => router.push('/account')}>
      <View style={[styles.round, { backgroundColor: colors.fillStrong, borderColor: colors.border }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  round: { width: 40, height: 40, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700' },
});
