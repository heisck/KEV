import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  /** Rendered on the right edge (StatusPill, chevron, actions...). */
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
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.row, dimmed && styles.dimmed]}
      testID={testID}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>{title.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  dimmed: { opacity: 0.55 },
  avatar: { borderRadius: radii.pill, height: 44, width: 44 },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: colors.primary20,
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.primaryDeep, fontSize: 18, fontWeight: '700' },
  body: { flex: 1, gap: 2 },
  title: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  subtitle: { color: colors.muted, fontSize: 13 },
});
