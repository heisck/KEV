import { StyleSheet, Text, View } from 'react-native';

import { radii, spacing, usePalette } from '@/theme';

export type StatusTone = 'success' | 'warn' | 'error' | 'neutral';

type StatusPillProps = {
  label: string;
  tone: StatusTone;
  testID?: string;
};

/** Small colored badge for eligibility / attendance states. */
export function StatusPill({ label, tone, testID }: StatusPillProps) {
  const p = usePalette();
  const bg = {
    success: p.successSoft,
    warn: p.warnSoft,
    error: p.errorSoft,
    neutral: p.surfaceDim,
  }[tone];
  const dot = { success: p.success, warn: p.warn, error: p.error, neutral: p.muted }[tone];
  const label_ = { success: p.success, warn: p.warn, error: p.error, neutral: p.inkSoft }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]} testID={testID}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={[styles.label, { color: label_ }]}>{label}</Text>
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
