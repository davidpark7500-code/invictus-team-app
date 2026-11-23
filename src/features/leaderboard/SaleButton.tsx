import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Glass } from '@/components/glass/Glass';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Spacing } from '@/theme/tokens';

import type { SaleKind } from './rank';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 11, stiffness: 260, mass: 0.9 }; // ~460ms with overshoot

function numberSize(n: number) {
  const digits = String(n).length;
  if (digits >= 4) return 30;
  if (digits === 3) return 38;
  return 50;
}

/** Big tinted-glass button: gold for memberships, blue for orders. */
export function SaleButton({ kind, count, onTap }: { kind: SaleKind; count: number; onTap: () => void }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const isMembership = kind === 'membership';
  const accent = isMembership ? colors.brand : colors.blue;
  const onAccent = isMembership ? colors.onBrand : colors.onBlue;
  const tint = isMembership ? colors.brandSoft : colors.blueSoft;

  const press = useSharedValue(1);
  const chip = useSharedValue(0);
  const pop = useSharedValue(1);
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current && !reduceMotion) {
      pop.value = withSequence(withTiming(0.6, { duration: 0 }), withTiming(1.2, { duration: 180 }), withTiming(1, { duration: 280 }));
    }
    prev.current = count;
  }, [count, pop, reduceMotion]);

  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - chip.value * 0.16 }, { rotate: `${chip.value * 90}deg` }],
  }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={isMembership ? `Add a membership, ${count} so far` : `Add a $150+ order, ${count} so far`}
      style={[styles.hit, pressStyle]}
      onPressIn={() => {
        if (reduceMotion) return;
        press.value = withTiming(0.92, { duration: 90 });
        chip.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        press.value = reduceMotion ? 1 : withSpring(1, SPRING);
        chip.value = reduceMotion ? 0 : withSpring(0, SPRING);
      }}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onTap();
      }}>
      <Glass radius={26} tintColor={tint} style={[styles.card, { borderColor: colors.border }]}>
        {/* Soft diagonal sheen from the top-left. */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.38)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.55, y: 0.75 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.label, { backgroundColor: accent }]}>
          <Text variant="caption" style={[styles.labelText, { color: onAccent }]}>
            {isMembership ? 'MEMBERSHIP' : 'ORDER'}
          </Text>
        </View>
        <View style={styles.bottom}>
          <View style={styles.numbers}>
            <Animated.View style={popStyle}>
              <Text style={[styles.count, { fontSize: numberSize(count), lineHeight: numberSize(count) * 1.05 }]}>
                {count}
              </Text>
            </Animated.View>
            <Text variant="footnote" color="textSecondary" numberOfLines={1}>
              {isMembership ? '$20 each' : '$150+'}
            </Text>
          </View>
          <Animated.View style={[styles.chip, { backgroundColor: accent }, chipStyle]}>
            <Text style={[styles.plus, { color: onAccent }]}>+</Text>
          </Animated.View>
        </View>
      </Glass>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  hit: { flex: 1 },
  card: {
    minHeight: 148,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  labelText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.sm },
  numbers: { flexShrink: 1, gap: 6 },
  count: { fontWeight: '700', letterSpacing: -1.2, fontVariant: ['tabular-nums'] },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  plus: { fontSize: 28, fontWeight: '500', lineHeight: 30 },
});
