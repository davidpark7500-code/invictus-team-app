import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { Radius, Spacing } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: IconName;
  iconColor?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
};

export function ListRow({ title, subtitle, meta, icon, iconColor, leading, trailing, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Card onPress={onPress} padded={false} style={styles.row}>
      {leading ??
        (icon ? (
          <View style={[styles.iconWrap, { backgroundColor: iconColor ?? colors.accentSoft }]}>
            <Icon name={icon} size={18} color={iconColor ? colors.onAccent : colors.accent} />
          </View>
        ) : null)}
      <View style={styles.body}>
        <Text variant="headline" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subheadline" color="textSecondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="caption" color="textTertiary">
            {meta}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Icon name="chevron" size={14} color={colors.textTertiary} /> : null)}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
});
