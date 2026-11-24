import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glass } from '@/components/glass/Glass';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

import type { SaleKind } from './rank';
import { removeMySales } from './useLeaderboard';

type Counts = { memberships: number; orders: number };

/**
 * Ported from Pulse Board. Lets someone lower their own count for THIS week after tapping too
 * many times. They can only go down from what's logged (adding is what the big buttons are for,
 * and those tell the team); Save removes the difference, newest taps first.
 */
export function FixCountSheet({ open, onClose, current }: { open: boolean; onClose: () => void; current: Counts }) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      {/* Mounted fresh on each open, so it always starts from the real numbers. */}
      {open ? <Sheet onClose={onClose} current={current} /> : null}
    </Modal>
  );
}

function Sheet({ onClose, current }: { onClose: () => void; current: Counts }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [memberships, setMemberships] = useState(current.memberships);
  const [orders, setOrders] = useState(current.orders);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const removeMem = current.memberships - memberships;
  const removeOrd = current.orders - orders;
  const changed = removeMem > 0 || removeOrd > 0;

  async function save() {
    setSaving(true);
    setError(null);
    const failed =
      (removeMem > 0 ? await removeMySales('membership', removeMem) : null) ??
      (removeOrd > 0 ? await removeMySales('order', removeOrd) : null);
    setSaving(false);
    if (failed) setError(failed);
    else onClose();
  }

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
      <Glass radius={30} tintColor={colors.backgroundElevated} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <View style={styles.copy}>
          <Text variant="title2">Fix this week’s count</Text>
          <Text variant="subheadline" color="textSecondary">
            Tapped too many times? Bring your numbers down to what you really made. Your most recent taps come off first.
          </Text>
        </View>

        <Stepper kind="membership" value={memberships} max={current.memberships} onChange={setMemberships} disabled={saving} />
        <Stepper kind="order" value={orders} max={current.orders} onChange={setOrders} disabled={saving} />

        {error ? (
          <Text variant="footnote" style={{ color: colors.danger }}>
            {error}
          </Text>
        ) : null}

        <Button
          label={changed ? `Remove ${summary(removeMem, removeOrd)}` : 'Save'}
          onPress={save}
          disabled={!changed}
          loading={saving}
        />
        <Button label="Cancel" variant="quiet" onPress={onClose} disabled={saving} />
      </Glass>
    </View>
  );
}

function summary(mem: number, ord: number) {
  const parts = [];
  if (mem > 0) parts.push(`${mem} membership${mem === 1 ? '' : 's'}`);
  if (ord > 0) parts.push(`${ord} order${ord === 1 ? '' : 's'}`);
  return parts.join(' and ');
}

function Stepper({
  kind,
  value,
  max,
  onChange,
  disabled,
}: {
  kind: SaleKind;
  value: number;
  max: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  const { colors } = useTheme();
  const isMembership = kind === 'membership';
  const noun = isMembership ? 'membership' : 'order';
  return (
    <View style={[styles.stepper, { backgroundColor: isMembership ? colors.brandSoft : colors.blueSoft }]}>
      <View style={styles.stepperText}>
        <Text style={[styles.kind, { color: isMembership ? colors.brandText : colors.blueText }]}>
          {isMembership ? 'MEMBERSHIPS' : '$150+ ORDERS'}
        </Text>
        <Text variant="caption" color="textSecondary">
          {value === max ? `${max} logged this week` : `was ${max}`}
        </Text>
      </View>
      <View style={styles.controls}>
        <RoundButton icon="remove" label={`One fewer ${noun}`} disabled={disabled || value <= 0} onPress={() => onChange(Math.max(0, value - 1))} />
        <Text style={styles.value} accessibilityLiveRegion="polite">
          {value}
        </Text>
        <RoundButton icon="add" label={`One more ${noun}`} disabled={disabled || value >= max} onPress={() => onChange(Math.min(max, value + 1))} />
      </View>
    </View>
  );
}

function RoundButton({ icon, label, disabled, onPress }: { icon: 'add' | 'remove'; label: string; disabled: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={disabled && styles.off}>
      <Glass interactive radius={Radius.pill} style={styles.round}>
        <Icon name={icon} size={18} color={colors.text} />
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  copy: { gap: Spacing.xs, marginBottom: Spacing.xs },
  stepper: {
    borderRadius: 18,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  stepperText: { flexShrink: 1, gap: 2 },
  kind: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  value: { width: 44, textAlign: 'center', fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.35 },
});
