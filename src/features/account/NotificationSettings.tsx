import { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import {
  type AlertPrefs,
  DEFAULT_ALERT_PREFS,
  enablePushAlerts,
  loadAlertPrefs,
  type PushResult,
  saveAlertPrefs,
} from '@/features/leaderboard/push';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

const MESSAGE: Record<PushResult, string> = {
  enabled: 'Notifications are on for this phone.',
  denied: 'Notifications are turned off for this app. Turn them on in Settings, then try again.',
  unsupported: 'Notifications work in the iPhone and Android app, not in a browser.',
  'not-configured': 'Notifications will work once the app is connected to its server.',
  error: 'Couldn’t turn notifications on. Try again in a moment.',
};

/** Notifications, in the Account sheet: what to hear about, and turning them on for this phone. */
export function NotificationSettings() {
  const { colors } = useTheme();
  const [prefs, setPrefs] = useState<AlertPrefs>(DEFAULT_ALERT_PREFS);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PushResult | null>(null);

  // Show what this person chose last time.
  useEffect(() => {
    let cancelled = false;
    loadAlertPrefs()
      .then((saved) => {
        if (saved && !cancelled) setPrefs(saved);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key: keyof AlertPrefs) => (value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    saveAlertPrefs({ [key]: value }).catch(() => {});
  };

  return (
    <View style={styles.body}>
      <Text variant="headline">Team updates</Text>
      <Row label="New events" value={prefs.notify_events} onChange={set('notify_events')} tint={colors.brand} />
      <Row label="New resources" value={prefs.notify_resources} onChange={set('notify_resources')} tint={colors.brand} />

      <Text variant="headline" style={styles.groupTitle}>
        Sale alerts
      </Text>
      <Text variant="subheadline" color="textSecondary">
        When a teammate logs a sale. You never get alerts for your own.
      </Text>
      <Row label="New memberships" value={prefs.notify_membership} onChange={set('notify_membership')} tint={colors.brand} />
      <Row label="New $150+ orders" value={prefs.notify_order} onChange={set('notify_order')} tint={colors.blue} />

      <Button
        label={result === 'enabled' ? 'Notifications on' : 'Turn on notifications'}
        icon="bell"
        loading={busy}
        disabled={result === 'enabled'}
        onPress={async () => {
          setBusy(true);
          setResult(await enablePushAlerts());
          setBusy(false);
        }}
      />
      {result ? (
        <Text variant="footnote" color={result === 'enabled' ? 'success' : 'textSecondary'}>
          {MESSAGE[result]}
        </Text>
      ) : null}
    </View>
  );
}

function Row({ label, value, onChange, tint }: { label: string; value: boolean; onChange: (v: boolean) => void; tint: string }) {
  return (
    <View style={styles.row}>
      <Text variant="body" style={styles.rowLabel}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: tint }} thumbColor="#FFFFFF" accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.md },
  groupTitle: { marginTop: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { flex: 1 },
});
