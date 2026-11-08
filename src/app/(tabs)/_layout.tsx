import { NativeTabs } from 'expo-router/native-tabs';

import { hasNativeGlass } from '@/components/glass/Glass';
import { icons } from '@/components/ui/Icon';
import { MiniPlayer } from '@/features/audio/MiniPlayer';
import { useTheme } from '@/theme/ThemeProvider';

const tabs = [
  { name: '(home)', label: 'Home', icon: icons.home },
  { name: 'events', label: 'Events', icon: icons.events },
  { name: 'profiles', label: 'Profiles', icon: icons.list },
  { name: 'resources', label: 'Resources', icon: icons.resources },
] as const;

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={colors.brandText}
      iconColor={{ default: colors.textSecondary, selected: colors.brandText }}
      labelStyle={{ default: { color: colors.textSecondary }, selected: { color: colors.brandText } }}
      indicatorColor={colors.brandSoft}
      rippleColor={colors.brandSoft}>
      {tabs.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.icon.ios} md={tab.icon.md} />
        </NativeTabs.Trigger>
      ))}
      {hasNativeGlass ? (
        <NativeTabs.BottomAccessory>
          <AccessoryPlayer />
        </NativeTabs.BottomAccessory>
      ) : null}
    </NativeTabs>
  );
}

function AccessoryPlayer() {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  return <MiniPlayer placement={placement} />;
}
