import { Stack } from 'expo-router';

export default function LeaderboardStack() {
  // The screen draws its own header so the colour glow can run behind it.
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />;
}
