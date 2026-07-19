import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { colors, radii, spacing } from '@/theme';

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  testID?: string;
};

export function Chip({ label, active = false, onPress, testID }: ChipProps) {
  return (
    <GlassPressable
      haptic="select"
      onPress={onPress}
      surfaceStyle={[styles.chip, active && styles.chipActive]}
      tintColor={active ? colors.black : colors.primary08}
      glassEffectStyle={active ? 'regular' : 'clear'}
      testID={testID}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </GlassPressable>
  );
}

type ChipRowProps = {
  labels: string[];
  activeLabel?: string;
  onSelect?: (label: string) => void;
  scrollable?: boolean;
};

export function ChipRow({ labels, activeLabel, onSelect, scrollable = true }: ChipRowProps) {
  const chips = labels.map((label) => (
    <Chip
      key={label}
      label={label}
      active={label === activeLabel}
      onPress={onSelect ? () => onSelect(label) : undefined}
    />
  ));
  if (!scrollable) return <View style={styles.row}>{chips}</View>;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipActive: {},
  label: { color: colors.primaryDeep, fontSize: 13, fontWeight: '600' },
  labelActive: { color: colors.white },
  row: { flexDirection: 'row', gap: spacing.sm },
});
