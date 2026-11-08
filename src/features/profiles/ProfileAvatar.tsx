import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { Profile } from '@/data/types';
import { useTheme } from '@/theme/ThemeProvider';

/** Round portrait; initials until the real photo is supplied. */
export function ProfileAvatar({ profile, size = 56 }: { profile: Profile; size?: number }) {
  const { colors } = useTheme();
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (profile.photoUrl) {
    return <Image source={{ uri: profile.photoUrl }} style={style} contentFit="cover" accessibilityLabel={displayName(profile)} />;
  }
  return (
    <View style={[styles.initials, style, { backgroundColor: colors.brandSoft }]}>
      <Text variant={size > 80 ? 'largeTitle' : 'headline'} style={{ color: colors.brandText }}>
        {profile.lastName.slice(0, 1)}
      </Text>
    </View>
  );
}

export function displayName(p: Profile) {
  return `${p.firstNames} ${p.lastName}`;
}

export function pinLabel(p: Profile) {
  return [p.founders ? 'Founders' : null, p.pin, p.qualifying ? 'Qual' : null].filter(Boolean).join(' ');
}

const styles = StyleSheet.create({
  initials: { alignItems: 'center', justifyContent: 'center' },
});
