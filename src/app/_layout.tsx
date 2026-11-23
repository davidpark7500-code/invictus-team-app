import '@/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { StatusBarFade } from '@/components/ui/StatusBarFade';
import { GlowBackground } from '@/features/leaderboard/GlowBackground';
import { FloatingMiniPlayer } from '@/features/audio/MiniPlayer';
import { PlayerProvider } from '@/features/audio/PlayerProvider';
import { ContentProvider } from '@/data/content';
import { useNotificationTaps } from '@/features/account/useNotificationTaps';
import { AuthProvider, useAuth } from '@/lib/AuthProvider';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ContentProvider>
          <PlayerProvider>
            <RootNavigator />
          </PlayerProvider>
        </ContentProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, loading, demoMode } = useAuth();
  const { scheme, colors } = useTheme();
  const signedIn = demoMode || !!session;
  useNotificationTaps(signedIn && !loading);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {/* Colour glow behind every screen, so the glass has something to refract. */}
      <GlowBackground />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="account"
            options={{
              presentation: 'formSheet',
              contentStyle: { backgroundColor: colors.backgroundElevated },
              sheetAllowedDetents: [0.6, 1],
              sheetGrabberVisible: true,
              sheetCornerRadius: 28,
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
      <FloatingMiniPlayer />
      <StatusBarFade />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
