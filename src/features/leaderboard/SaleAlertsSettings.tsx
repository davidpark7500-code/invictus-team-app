import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

import { enablePushAlerts, type PushResult, saveAlertPrefs } from './push';

const MESSAGE: Record<PushResult, string> = {
  enabled: 'Alerts are on for this phone.',
  denied: 'Notifications are turned off for this app. Turn them on in Settings, then try again.',
  unsupported: 'Alerts work in the iPhone and Android app, not in a browser.',
  'not-configured': 'Alerts will work once the app is connected to its server.',
  error: 'Couldn\u2019t turn alerts on. Try again in a moment.',
};

/** Sale alerts, in the Account sheet: turn on push alerts and choose which sales to hear about. */
export function SaleAlertsSettings() {
  const { colors } = useTheme();
  const [membership, setMembership] = useState(true);
  const [order, setOrder] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PushResult | null>(null);

  const update = (next: { m?: boolean; o?: boolean }) => {
    const m = next.m ?? membership;
    const o = next.o ?? order;
    setMembership(m);
    setOrder(o);
    saveAlertPrefs({ notify_membership: m, notify_order: o }).catch(() => {});
  };

  return (
    <View style={styles.body}>
      <Text variant="headline">Sale alerts</Text>
      <Text variant="subheadline" color="textSecondary">
        Get a notification when a teammate logs a sale. You never get alerts for your own.
      </Text>
      <Row label="New memberships" value={membership} onChange={(m) => update({ m })} tint={colors.brand} />
      <Row label="New $150+ orders" value={order} onChange={(o) => update({ o })} tint={colors.blue} />
      <Button
        label={result === 'enabled' ? 'Alerts on' : 'Turn on alerts'}
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { flex: 1 },
});
