import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { stackScreenOptions } from '@/lib/stackOptions';
import { useTheme } from '@/theme/ThemeProvider';

export default function ResourcesStack() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Stack screenOptions={stackScreenOptions(colors, insets.top)}>
      {/* The screen draws the logo header itself, like Leaderboard. */}
      <Stack.Screen name="index" options={{ title: 'Resources', headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: '', headerLargeTitle: false }} />
    </Stack>
  );
}
