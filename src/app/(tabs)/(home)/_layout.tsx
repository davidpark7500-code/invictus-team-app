import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/stackOptions';
import { useTheme } from '@/theme/ThemeProvider';

export default function HomeStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={stackScreenOptions(colors)}>
      <Stack.Screen
        name="index"
        // No "Home" title bar: the screen draws its own top row, lined up with the other tabs.
        options={{ title: 'Home', headerShown: false }}
      />
    </Stack>
  );
}
