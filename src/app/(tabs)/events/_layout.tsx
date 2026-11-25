import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { stackScreenOptions } from '@/lib/stackOptions';
import { useTheme } from '@/theme/ThemeProvider';

/** Opening a detail page from another tab, a link or a refresh still puts the list under it, so Back works. */
export const unstable_settings = { initialRouteName: 'index' };

export default function EventsStack() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Stack screenOptions={stackScreenOptions(colors, insets.top)}>
      {/* The screen draws the logo header itself, like Leaderboard. */}
      <Stack.Screen name="index" options={{ title: 'Events', headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: '', headerLargeTitle: false }} />
    </Stack>
  );
}
