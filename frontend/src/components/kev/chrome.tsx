import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BackIcon, ClockIcon } from '@/components/kev/icons';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { radii, spacing, usePalette } from '@/theme';

/** 48pt glass circle button (bell / back / scan). */
export function CircleButton({
  children,
  onPress,
  label,
}: {
  children: ReactNode;
  onPress?: () => void;
  label: string;
}) {
  const p = usePalette();
  return (
    <GlassPressable
      accessibilityLabel={label}
      onPress={onPress}
      surfaceStyle={styles.circle}
      tintColor={p.surface}
      glassEffectStyle="clear"
    >
      {children}
    </GlassPressable>
  );
}

/** Centered screen header: back — title — trailing action (kev mockup). */
export function ScreenTopBar({
  title,
  onBack,
  trailing,
}: {
  title: string;
  onBack: () => void;
  trailing?: ReactNode;
}) {
  const p = usePalette();
  return (
    <View style={styles.topBar}>
      <CircleButton label="Go back" onPress={onBack}>
        <BackIcon color={p.ink} />
      </CircleButton>
      <Text style={[styles.topTitle, { color: p.ink }]}>{title}</Text>
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

/** Pink "Upcoming" / green "Ongoing" / neutral "Past" pill — icon + label on one row. */
export function StatusChip({ status }: { status: 'Upcoming' | 'Ongoing' | 'Past' }) {
  const p = usePalette();
  const isUpcoming = status === 'Upcoming';
  const isOngoing = status === 'Ongoing';
  const tint = isOngoing ? p.success : isUpcoming ? p.pink : p.muted;
  const bg = isOngoing ? p.successSoft : isUpcoming ? p.pinkSoft : p.surfaceDim;
  return (
    <View style={[styles.chip, styles.chipRow, { backgroundColor: bg }]}>
      <ClockIcon color={tint} />
      <Text style={[styles.chipText, { color: tint }]}>{status}</Text>
    </View>
  );
}

/** Small blue glass action chip ("Open in map", "Post"). */
export function BlueChip({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress?: () => void;
}) {
  const p = usePalette();
  return (
    <GlassPressable
      haptic="select"
      onPress={onPress}
      surfaceStyle={[styles.chip, styles.blueChip]}
      tintColor={p.blueSoft}
      glassEffectStyle="clear"
    >
      <View style={styles.chipRow}>
        {icon}
        <Text style={[styles.chipText, { color: p.blue }]}>{label}</Text>
      </View>
    </GlassPressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 48,
  },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  topTitle: { fontSize: 16, fontWeight: '700' },
  trailing: { alignItems: 'flex-end', minWidth: 48 },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  chipRow: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  chipText: { fontSize: 12, fontWeight: '600' },
  blueChip: {},
} as const satisfies Record<string, ViewStyle | object>);
