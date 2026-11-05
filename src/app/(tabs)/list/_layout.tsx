import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/lib/stackOptions';
import { useTheme } from '@/theme/ThemeProvider';

export default function ListStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={stackScreenOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'List' }} />
      <Stack.Screen name="prospect/[id]" options={{ title: '', headerLargeTitle: false }} />
      <Stack.Screen name="customer/[id]" options={{ title: '', headerLargeTitle: false }} />
    </Stack>
  );
}
