import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BackIcon, ClockIcon } from '@/components/kev/icons';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { colors, radii, spacing } from '@/theme';

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
  return (
    <GlassPressable
      accessibilityLabel={label}
      onPress={onPress}
      surfaceStyle={styles.circle}
      tintColor={colors.white}
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
  return (
    <View style={styles.topBar}>
      <CircleButton label="Go back" onPress={onBack}>
        <BackIcon color={colors.ink} />
      </CircleButton>
      <Text style={styles.topTitle}>{title}</Text>
      <View style={styles.trailing}>{trailing}</View>
    </View>
  );
}

/** Pink "Upcoming" / green "Ongoing" pill — icon + label on one row. */
export function StatusChip({ status }: { status: 'Upcoming' | 'Ongoing' }) {
  const upcoming = status === 'Upcoming';
  const tint = upcoming ? colors.pink : colors.success;
  return (
    <View
      style={[
        styles.chip,
        styles.chipRow,
        { backgroundColor: upcoming ? colors.pinkSoft : colors.successSoft },
      ]}
    >
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
  return (
    <GlassPressable
      haptic="select"
      onPress={onPress}
      surfaceStyle={[styles.chip, styles.blueChip]}
      tintColor={colors.blueSoft}
      glassEffectStyle="clear"
    >
      <View style={styles.chipRow}>
        {icon}
        <Text style={[styles.chipText, styles.blueText]}>{label}</Text>
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
  topTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
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
  blueText: { color: colors.blue },
} as const satisfies Record<string, ViewStyle | object>);
