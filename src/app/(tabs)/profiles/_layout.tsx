import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/stackOptions';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfilesStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={stackScreenOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'Profiles' }} />
      <Stack.Screen name="[id]" options={{ title: '', headerLargeTitle: false }} />
    </Stack>
  );
}
