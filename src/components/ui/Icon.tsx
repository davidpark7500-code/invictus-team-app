import { SymbolView, type SymbolWeight } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/** One name per concept; SF Symbol on iOS, Material Symbol on Android and web. */
export const icons = {
  home: { ios: 'house.fill', md: 'home' },
  audio: { ios: 'headphones', md: 'headphones' },
  resources: { ios: 'folder.fill', md: 'folder' },
  events: { ios: 'calendar', md: 'calendar_month' },
  list: { ios: 'person.2.fill', md: 'group' },
  settings: { ios: 'gearshape.fill', md: 'settings' },
  play: { ios: 'play.fill', md: 'play_arrow' },
  pause: { ios: 'pause.fill', md: 'pause' },
  forward: { ios: 'goforward.30', md: 'forward_30' },
  rewind: { ios: 'gobackward.15', md: 'replay_10' },
  chevron: { ios: 'chevron.right', md: 'chevron_right' },
  chevronLeft: { ios: 'chevron.left', md: 'chevron_left' },
  trophy: { ios: 'trophy.fill', md: 'leaderboard' },
  pdf: { ios: 'doc.richtext.fill', md: 'picture_as_pdf' },
  link: { ios: 'link', md: 'link' },
  globe: { ios: 'globe', md: 'language' },
  video: { ios: 'video.fill', md: 'videocam' },
  download: { ios: 'arrow.down.circle', md: 'download' },
  share: { ios: 'square.and.arrow.up', md: 'share' },
  add: { ios: 'plus', md: 'add' },
  remove: { ios: 'minus', md: 'remove' },
  undo: { ios: 'arrow.uturn.backward', md: 'undo' },
  tune: { ios: 'slider.horizontal.3', md: 'tune' },
  check: { ios: 'checkmark', md: 'check' },
  photo: { ios: 'photo', md: 'image' },
  close: { ios: 'xmark', md: 'close' },
  edit: { ios: 'pencil', md: 'edit' },
  phone: { ios: 'phone.fill', md: 'phone' },
  mail: { ios: 'envelope.fill', md: 'mail' },
  pin: { ios: 'mappin.and.ellipse', md: 'location_on' },
  clock: { ios: 'clock', md: 'schedule' },
  bell: { ios: 'bell.fill', md: 'notifications' },
  star: { ios: 'star.fill', md: 'star' },
  mic: { ios: 'mic.fill', md: 'mic' },
  sparkles: { ios: 'sparkles', md: 'auto_awesome' },
  sun: { ios: 'sun.max.fill', md: 'light_mode' },
  moon: { ios: 'moon.fill', md: 'dark_mode' },
  auto: { ios: 'circle.lefthalf.filled', md: 'brightness_auto' },
  signOut: { ios: 'rectangle.portrait.and.arrow.right', md: 'logout' },
  search: { ios: 'magnifyingglass', md: 'search' },
  person: { ios: 'person.crop.circle.fill', md: 'person' },
  waveform: { ios: 'waveform', md: 'graphic_eq' },
  flag: { ios: 'flag.fill', md: 'flag' },
  notes: { ios: 'note.text', md: 'description' },
} as const;

export type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 20, color, weight = 'medium', style }: Props) {
  const { colors } = useTheme();
  const def = icons[name];
  return (
    <SymbolView
      name={{ ios: def.ios, android: def.md, web: def.md }}
      size={size}
      weight={weight}
      tintColor={color ?? colors.text}
      style={[{ width: size, height: size }, style]}
    />
  );
}
