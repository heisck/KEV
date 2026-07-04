import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

export type StatTileTone = 'neutral' | 'primary' | 'mint' | 'warn';

type StatTileProps = {
  label: string;
  count: number | string;
  tone?: StatTileTone;
  icon?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
};

/** Colored stat tile with a count badge — used in the 2×2 dashboard grid. */
export function StatTile({ label, count, tone = 'neutral', icon, onPress, testID }: StatTileProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={[styles.tile, tones[tone]]}
      testID={testID}
    >
      <View style={styles.top}>
        {icon}
        <View style={[styles.badge, badges[tone]]}>
          <Text style={[styles.count, counts[tone]]}>{count}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radii.lg,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'space-between',
    minHeight: 92,
    padding: spacing.lg,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    justifyContent: 'center',
    minWidth: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  count: { fontSize: 16, fontWeight: '800' },
  label: { color: colors.ink, fontSize: 13, fontWeight: '600' },
});

const tones = StyleSheet.create({
  neutral: { backgroundColor: colors.surfaceDim },
  primary: { backgroundColor: colors.primary12 },
  mint: { backgroundColor: colors.mint },
  warn: { backgroundColor: colors.warnSoft },
});

const badges = StyleSheet.create({
  neutral: { backgroundColor: colors.surface },
  primary: { backgroundColor: colors.primary },
  mint: { backgroundColor: colors.primaryDeep },
  warn: { backgroundColor: colors.warn },
});

const counts = StyleSheet.create({
  neutral: { color: colors.ink },
  primary: { color: colors.white },
  mint: { color: colors.white },
  warn: { color: colors.white },
});
