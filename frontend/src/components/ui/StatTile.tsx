import { StyleSheet, Text, View } from 'react-native';

import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';

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
  const p = usePalette();
  const tones = {
    neutral: { backgroundColor: p.surfaceDim },
    primary: { backgroundColor: p.primary12 },
    mint: { backgroundColor: p.mint },
    warn: { backgroundColor: p.warnSoft },
  } as const;
  const badges = {
    neutral: { backgroundColor: p.surface },
    primary: { backgroundColor: p.primary },
    mint: { backgroundColor: p.primaryDeep },
    warn: { backgroundColor: p.warn },
  } as const;
  const counts = {
    neutral: { color: p.ink },
    primary: { color: p.onPrimary },
    mint: { color: p.onPrimary },
    warn: { color: p.onPrimary },
  } as const;
  return (
    <HapticPressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      haptic={onPress ? 'tap' : 'none'}
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
      <Text style={[styles.label, { color: p.ink }]}>{label}</Text>
    </HapticPressable>
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
  label: { fontSize: 13, fontWeight: '600' },
});
