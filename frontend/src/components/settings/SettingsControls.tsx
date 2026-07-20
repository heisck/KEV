import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HapticPressable } from '@/components/ui/HapticPressable';
import { NativePreferenceSwitch } from '@/components/ui/NativePreferenceSwitch';
import { radii, spacing } from '@/theme';
import type { Palette } from '@/theme';

/** A labelled row wrapping a settings control. */
export function SettingRow({
  label,
  hint,
  palette: p,
  children,
}: {
  label: string;
  hint?: string;
  palette: Palette;
  children: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: p.ink }]}>{label}</Text>
        {hint ? <Text style={[styles.rowHint, { color: p.muted }]}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

/** Pill segmented control — one active option, palette-aware. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  palette: p,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  palette: Palette;
}) {
  return (
    <View style={[styles.segment, { backgroundColor: p.surfaceDim }]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <HapticPressable
            key={opt.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            haptic="select"
            onPress={() => onChange(opt.value)}
            style={[styles.segmentItem, active && { backgroundColor: p.primary }]}
          >
            <Text style={[styles.segmentLabel, { color: active ? p.onPrimary : p.inkSoft }]}>
              {opt.label}
            </Text>
          </HapticPressable>
        );
      })}
    </View>
  );
}

/** Native platform switch; iOS renders Apple's UISwitch. */
export function SettingToggle({
  value,
  onToggle,
  testID,
}: {
  value: boolean;
  onToggle: () => void;
  testID?: string;
}) {
  return <NativePreferenceSwitch value={value} onValueChange={onToggle} testID={testID} />;
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, minHeight: 44 },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 14, fontWeight: '700' },
  rowHint: { fontSize: 12, fontWeight: '500' },
  segment: { borderRadius: radii.pill, flexDirection: 'row', gap: 2, padding: 3 },
  segmentItem: {
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
  },
  segmentLabel: { fontSize: 12, fontWeight: '700' },
});
