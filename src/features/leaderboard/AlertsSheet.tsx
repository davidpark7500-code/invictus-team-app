import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';

import { Glass } from '@/components/glass/Glass';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

import { enablePushAlerts, type PushResult, saveAlertPrefs } from './push';

const MESSAGE: Record<PushResult, string> = {
  enabled: 'Alerts are on for this phone.',
  denied: 'Notifications are turned off for this app. Turn them on in Settings, then try again.',
  unsupported: 'Alerts work in the iPhone and Android app, not in a browser.',
  'not-configured': 'Alerts will work once the app is connected to its server.',
  error: 'Couldn’t turn alerts on. Try again in a moment.',
};

/** Bell sheet: turn on push alerts and choose which sales to hear about. */
export function AlertsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close alerts">
        <Pressable onPress={() => {}} style={styles.sheetWrap}>
          <Glass radius={Radius.xl} tintColor={colors.surfaceStrong} style={[styles.sheet, { borderColor: colors.border }]}>
            <Text variant="title3">Sale alerts</Text>
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
            <Button label="Done" variant="quiet" onPress={onClose} />
          </Glass>
        </Pressable>
      </Pressable>
    </Modal>
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
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: Spacing.lg },
  sheetWrap: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  sheet: { padding: Spacing.xl, gap: Spacing.md, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { flex: 1 },
});
