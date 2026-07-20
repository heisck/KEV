import { StyleSheet, Text, View } from 'react-native';

import { radii, spacing, usePalette } from '@/theme';

type Props = { code: string; password: string };

/** Join credentials shown to the session creator and its invigilators. */
export function SessionAccessCard({ code, password }: Props) {
  const p = usePalette();
  return (
    <View style={[styles.card, { backgroundColor: p.surfaceDim, borderColor: p.hairline }]}>
      <View style={styles.item}>
        <Text style={[styles.label, { color: p.muted }]}>Session code</Text>
        <Text selectable style={[styles.value, { color: p.ink }]}>
          {code}
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: p.hairline }]} />
      <View style={styles.item}>
        <Text style={[styles.label, { color: p.muted }]}>Lecturer join password</Text>
        <Text selectable style={[styles.password, { color: p.primary }]}>
          {password}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    padding: spacing.lg,
  },
  item: { flex: 1, gap: spacing.xs },
  label: { fontSize: 11, fontWeight: '600' },
  value: { fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  password: { fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  divider: { marginHorizontal: spacing.lg, width: StyleSheet.hairlineWidth },
});
