import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Glass } from '@/components/glass/Glass';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius } from '@/theme/tokens';

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
      <Glass interactive radius={Radius.pill} tintColor={colors.fillStrong} style={styles.round}>
        <Text style={styles.initials}>{initials}</Text>
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  round: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700' },
});
