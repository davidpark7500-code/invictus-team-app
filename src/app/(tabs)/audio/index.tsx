import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { formatDate, formatDuration } from '@/data/format';
import { audios } from '@/data/mock';
import { usePlayer } from '@/features/audio/PlayerProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius } from '@/theme/tokens';

export default function AudioScreen() {
  const { colors } = useTheme();
  const { track, playing } = usePlayer();
  const router = useRouter();

  const bySeries = useMemo(() => {
    const map = new Map<string, typeof audios>();
    for (const a of audios) map.set(a.series, [...(map.get(a.series) ?? []), a]);
    return [...map.entries()];
  }, []);

  return (
    <Screen>
      {bySeries.map(([series, items]) => (
        <View key={series} style={styles.group}>
          <SectionHeader title={series} />
          {items.map((a) => {
            const active = track?.id === a.id;
            return (
              <ListRow
                key={a.id}
                title={a.title}
                subtitle={a.speaker}
                meta={`${formatDuration(a.durationSec)} · ${formatDate(a.recordedAt)}`}
                leading={
                  <View style={[styles.art, { backgroundColor: active ? colors.accent : colors.accentSoft }]}>
                    <Icon
                      name={active && playing ? 'waveform' : 'play'}
                      size={16}
                      color={active ? colors.onAccent : colors.accent}
                    />
                  </View>
                }
                onPress={() => router.push(`/audio/${a.id}`)}
              />
            );
          })}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 12 },
  art: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
});
