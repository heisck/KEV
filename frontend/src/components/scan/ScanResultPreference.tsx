import { StyleSheet, Text, View } from 'react-native';

import { NativePreferenceSwitch } from '@/components/ui/NativePreferenceSwitch';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing, usePalette } from '@/theme';

export function ScanResultPreference() {
  const p = usePalette();
  const value = useSettingsStore((state) => state.showSuccessPage);
  const setValue = useSettingsStore((state) => state.setShowSuccessPage);

  return (
    <View style={[styles.row, { backgroundColor: p.surfaceDim }]}>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: p.ink }]}>Show result page after scan</Text>
        <Text style={[styles.subtitle, { color: p.muted }]}>
          Show each student before continuing
        </Text>
      </View>
      <NativePreferenceSwitch value={value} onValueChange={setValue} testID="success-page-toggle" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '700' },
  subtitle: { fontSize: 12, fontWeight: '500' },
});
