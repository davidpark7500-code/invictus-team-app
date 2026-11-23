import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

// Show alerts even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushResult = 'enabled' | 'denied' | 'unsupported' | 'not-configured' | 'error';

/**
 * Ask for permission, get this device's Expo push token and save it to the
 * signed-in person's account. Safe to call again; it just refreshes the token.
 */
export async function enablePushAlerts(): Promise<PushResult> {
  if (Platform.OS === 'web' || !Device.isDevice) return 'unsupported';
  if (!supabase) return 'not-configured';
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return 'not-configured';

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('sales', {
        name: 'Sales',
        // eslint-disable-next-line import/namespace -- re-exported via export *, which this rule misses
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return 'denied';

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const { error } = await supabase
      .from('expo_push_tokens')
      .upsert({ token, platform: Platform.OS, updated_at: new Date().toISOString() }, { onConflict: 'token' });
    return error ? 'error' : 'enabled';
  } catch {
    return 'error';
  }
}

/** Which kinds of sale this person wants alerts for (stored on their profile). */
export async function saveAlertPrefs(prefs: { notify_membership: boolean; notify_order: boolean }) {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from('profiles').update(prefs).eq('id', data.user.id);
}
