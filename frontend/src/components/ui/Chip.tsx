import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  testID?: string;
};

export function Chip({ label, active = false, onPress, testID }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      testID={testID}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
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
    backgroundColor: colors.primary08,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipActive: { backgroundColor: colors.black },
  label: { color: colors.primaryDeep, fontSize: 13, fontWeight: '600' },
  labelActive: { color: colors.white },
  row: { flexDirection: 'row', gap: spacing.sm },
});
