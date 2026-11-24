import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { FlatList, type NativeScrollEvent, type NativeSyntheticEvent, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Props = { photos: string[]; name: string };

/**
 * Swipe through a team member's photos, one at a time, with dots underneath.
 * On a computer, arrows step through them too (no swipe gesture there).
 */
export function PhotoGallery({ photos, name }: Props) {
  const { colors } = useTheme();
  // Measured, because '100%' heights don't work inside a sideways list.
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList<string>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(Math.max(0, Math.min(photos.length - 1, next)));
  };
  const go = (to: number) => {
    const clamped = Math.max(0, Math.min(photos.length - 1, to));
    list.current?.scrollToOffset({ offset: clamped * width, animated: true });
    setIndex(clamped);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.frame, { backgroundColor: colors.fill }]} onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
        {width ? (
          <FlatList
            ref={list}
            data={photos}
            keyExtractor={(uri) => uri}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            renderItem={({ item, index: i }) => (
              <Image
                source={{ uri: item }}
                style={{ width, height }}
                contentFit="cover"
                transition={200}
                accessibilityLabel={`${name}, photo ${i + 1} of ${photos.length}`}
              />
            )}
          />
        ) : null}

        {Platform.OS === 'web' && photos.length > 1 ? (
          <>
            {index > 0 ? <Arrow side="left" onPress={() => go(index - 1)} /> : null}
            {index < photos.length - 1 ? <Arrow side="right" onPress={() => go(index + 1)} /> : null}
          </>
        ) : null}
      </View>

      {photos.length > 1 ? (
        <View style={styles.dots} accessibilityLabel={`Photo ${index + 1} of ${photos.length}`}>
          {photos.map((uri, i) => (
            <View
              key={uri}
              style={[styles.dot, { backgroundColor: i === index ? colors.brand : colors.fillStrong }, i === index && styles.dotOn]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Arrow({ side, onPress }: { side: 'left' | 'right'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={side === 'left' ? 'Previous photo' : 'Next photo'}
      style={[styles.arrow, side === 'left' ? styles.arrowLeft : styles.arrowRight]}>
      <Icon name={side === 'left' ? 'chevronLeft' : 'chevron'} size={18} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  frame: { width: '100%', aspectRatio: 4 / 3, borderRadius: Radius.lg, overflow: 'hidden' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOn: { width: 18 },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  arrowLeft: { left: Spacing.sm },
  arrowRight: { right: Spacing.sm },
});
