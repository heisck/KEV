import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, shadows, spacing } from '@/theme';
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

const TRACK_W = 52;
const KNOB = 26;

/** Apple-style toggle switch, palette-aware. */
export function SettingToggle({
  value,
  onToggle,
  palette: p,
  testID,
}: {
  value: boolean;
  onToggle: () => void;
  palette: Palette;
  testID?: string;
}) {
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? TRACK_W - KNOB - 3 : 3, { damping: 18 }) }],
  }));
  return (
    <HapticPressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      haptic="select"
      onPress={onToggle}
      style={[styles.track, { backgroundColor: value ? p.primary : p.mintDeep }]}
      testID={testID}
    >
      <Animated.View style={[styles.knob, { backgroundColor: p.surface }, knobStyle]} />
    </HapticPressable>
  );
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
  track: { borderRadius: radii.pill, height: KNOB + 6, justifyContent: 'center', width: TRACK_W },
  knob: { borderRadius: KNOB / 2, height: KNOB, width: KNOB, ...shadows.card },
});
