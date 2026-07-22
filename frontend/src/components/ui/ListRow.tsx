import { StyleSheet, Text, View } from 'react-native';

import { HapticPressable } from '@/components/ui/HapticPressable';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { radii, spacing, usePalette } from '@/theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  dimmed?: boolean;
  testID?: string;
};

/** Student/invigilator row: avatar, name + detail, trailing slot. */
export function ListRow({
  title,
  subtitle,
  avatarUrl,
  trailing,
  onPress,
  onLongPress,
  dimmed = false,
  testID,
}: ListRowProps) {
  const p = usePalette();
  return (
    <HapticPressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress && !onLongPress}
      haptic={onPress ? 'select' : 'none'}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.row, { backgroundColor: p.surface }, dimmed && styles.dimmed]}
      testID={testID}
    >
      <InitialAvatar
        uri={avatarUrl}
        seed={title}
        imageStyle={styles.avatar}
        fallbackStyle={[styles.avatar, styles.avatarFallback, { backgroundColor: p.primary20 }]}
        initialStyle={[styles.avatarInitial, { color: p.primaryDeep }]}
      />
      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.title, { color: p.ink }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: p.muted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  dimmed: { opacity: 0.55 },
  avatar: { borderRadius: radii.pill, height: 44, width: 44 },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 18, fontWeight: '700' },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  subtitle: { fontSize: 13 },
});
