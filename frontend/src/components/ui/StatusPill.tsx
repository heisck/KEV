import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

export type StatusTone = 'success' | 'warn' | 'error' | 'neutral';

type StatusPillProps = {
  label: string;
  tone: StatusTone;
  testID?: string;
};

/** Small colored badge for eligibility / attendance states. */
export function StatusPill({ label, tone, testID }: StatusPillProps) {
  return (
    <View style={[styles.pill, tones[tone]]} testID={testID}>
      <View style={[styles.dot, dots[tone]]} />
      <Text style={[styles.label, labels[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  dot: { borderRadius: 3, height: 6, width: 6 },
  label: { fontSize: 12, fontWeight: '700' },
});

const tones = StyleSheet.create({
  success: { backgroundColor: colors.successSoft },
  warn: { backgroundColor: colors.warnSoft },
  error: { backgroundColor: colors.errorSoft },
  neutral: { backgroundColor: colors.surfaceDim },
});

const dots = StyleSheet.create({
  success: { backgroundColor: colors.success },
  warn: { backgroundColor: colors.warn },
  error: { backgroundColor: colors.error },
  neutral: { backgroundColor: colors.muted },
});

const labels = StyleSheet.create({
  success: { color: colors.success },
  warn: { color: colors.warn },
  error: { color: colors.error },
  neutral: { color: colors.inkSoft },
});
