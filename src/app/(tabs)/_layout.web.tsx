import type { Href } from 'expo-router';
import { TabList, type TabListProps, TabSlot, TabTrigger, type TabTriggerSlotProps, Tabs } from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';

import { Glass } from '@/components/glass/Glass';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { withAlpha } from '@/components/ui/StatusBarFade';
import { Text } from '@/components/ui/Text';
import { FloatingMiniPlayer } from '@/features/audio/MiniPlayer';
import { useTheme } from '@/theme/ThemeProvider';
import { MaxContentWidth, Radius, Spacing } from '@/theme/tokens';

const tabs: { name: string; href: Href; label: string; icon: IconName }[] = [
  { name: '(home)', href: '/', label: 'Home', icon: 'home' },
  { name: 'leaderboard', href: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { name: 'events', href: '/events', label: 'Events', icon: 'events' },
  { name: 'profiles', href: '/profiles', label: 'Profiles', icon: 'list' },
  { name: 'resources', href: '/resources', label: 'Resources', icon: 'resources' },
];

/** Web: a floating glass tab bar at the bottom, mirroring the native one. */
export default function TabsLayoutWeb() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <BottomFade />
      <FloatingMiniPlayer />
      {/* The router only finds TabTriggers that are direct children of TabList
          (or of its single asChild wrapper), so the glass bar must be that wrapper. */}
      <TabList asChild>
        <GlassTabBar>
          {tabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton label={tab.label} icon={tab.icon} />
            </TabTrigger>
          ))}
        </GlassTabBar>
      </TabList>
    </Tabs>
  );
}

/** Fades the page out behind and below the tab bar, so text doesn't run on under it to the screen edge. */
function BottomFade() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[withAlpha(colors.background, 0), withAlpha(colors.background, 0.85), colors.background]}
      locations={[0, 0.45, 0.75]}
      style={[styles.bottomFade, { height: tabBarBottom(insets.bottom) + BAR_HEIGHT + Spacing.xl }]}
    />
  );
}

/** Clear of the iPhone home indicator when opened from the Home Screen. */
const tabBarBottom = (insetBottom: number) => Math.max(insetBottom, Spacing.lg);
const BAR_HEIGHT = 60;

function GlassTabBar({ children, style: _style, ...rest }: TabListProps) {
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View {...rest} style={[styles.list, { bottom: tabBarBottom(insets.bottom) }]} pointerEvents="box-none">
      <Glass radius={Radius.pill} tintColor={BAR_TINT[scheme]} style={styles.bar}>
        {children}
      </Glass>
    </View>
  );
}

function TabButton({ label, icon, isFocused, ...props }: TabTriggerSlotProps & { label: string; icon: IconName }) {
  const { colors } = useTheme();
  return (
    <Pressable {...props} haptic={false} style={styles.trigger}>
      <View style={[styles.triggerInner, isFocused && { backgroundColor: colors.brandSoft }]}>
        <Icon name={icon} size={20} color={isFocused ? colors.brandText : colors.textSecondary} />
        <Text variant="caption" color={isFocused ? 'brandText' : 'textSecondary'}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

/** Thinner than a card, so what scrolls underneath shows through, blurred. */
const BAR_TINT = { dark: 'rgba(28,28,34,0.48)', light: 'rgba(255,255,255,0.55)' } as const;

const styles = StyleSheet.create({
  slot: { flex: 1 },
  bottomFade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  list: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.xs,
    maxWidth: MaxContentWidth,
    width: '92%',
  },
  trigger: { flex: 1 },
  triggerInner: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
});
