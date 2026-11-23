import * as Notifications from 'expo-notifications';
import { type Href, router } from 'expo-router';
import { useEffect } from 'react';

/**
 * Tapping a notification opens what it's about: a new event, a new resource, or the
 * Leaderboard for a sale. Each notification carries its screen as `data.url`.
 */
export function useNotificationTaps(enabled: boolean) {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!enabled) return;
    const url = response?.notification.request.content.data?.url;
    if (typeof url === 'string' && url.startsWith('/')) router.push(url as Href);
  }, [enabled, response]);
}
