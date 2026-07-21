import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, type Palette } from '@/theme';

export function SectionLabel({ text, palette }: { text: string; palette: Palette }) {
  return <Text style={[styles.sectionLabel, { color: palette.muted }]}>{text}</Text>;
}

export function ProfileRow({
  icon,
  label,
  palette,
  onPress,
  danger,
  trailing,
  testID,
}: {
  icon: ReactNode;
  label: string;
  palette: Palette;
  onPress?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
  testID?: string;
}) {
  const color = danger ? palette.error : palette.ink;
  const content = (
    <>
      <View style={[styles.icon, { backgroundColor: danger ? palette.errorSoft : palette.mint }]}>
        {icon}
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {trailing ?? <ChevronRightIcon color={danger ? palette.error : palette.muted} />}
    </>
  );
  if (!onPress) {
    return <View style={[styles.row, { borderBottomColor: palette.hairline }]}>{content}</View>;
  }
  return (
    <HapticPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      haptic="select"
      onPress={onPress}
      style={[styles.row, { borderBottomColor: palette.hairline }]}
      testID={testID}
    >
      {content}
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xl,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.md,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  label: { flex: 1, fontSize: 15, fontWeight: '600' },
});
