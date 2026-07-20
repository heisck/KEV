import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lookupStudent } from '@/api/directory';
import { ScreenTopBar } from '@/components/kev/chrome';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned } from '@/data/exams';
import { useMockScan } from '@/hooks/useMockScan';
import { radii, spacing, usePalette } from '@/theme';

/** Manual verification — type the student's index number. */
export function ManualEntryScreen() {
  const p = usePalette();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const completeScan = useMockScan(exam ?? '1', 'MANUAL');

  const [index, setIndex] = useState('');
  const [notFound, setNotFound] = useState(false);

  const submit = async () => {
    if (!index.trim()) return;
    try {
      const student = await lookupStudent(index.trim());
      await completeScan(studentRecordToScanned(student));
    } catch {
      // Fallback check-in direct by index if directory check misses or offline
      await completeScan(index.trim());
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Manual entry" onBack={() => router.back()} />

      <View style={styles.body}>
        <Text style={[styles.label, { color: p.ink }]}>Index number</Text>
        <TextInput
          value={index}
          onChangeText={(t) => {
            setIndex(t);
            setNotFound(false);
          }}
          onSubmitEditing={submit}
          placeholder="e.g. 4211020"
          placeholderTextColor={p.muted}
          keyboardType="number-pad"
          returnKeyType="go"
          autoFocus
          style={[
            styles.input,
            { backgroundColor: p.surfaceDim, borderColor: p.hairline, color: p.ink },
            notFound && { borderColor: p.error },
          ]}
          testID="manual-index"
        />
        {notFound ? (
          <Text style={[styles.errorText, { color: p.error }]}>
            No student found with that index.
          </Text>
        ) : null}
        <HapticPressable
          accessibilityRole="button"
          onPress={submit}
          style={[styles.cta, { backgroundColor: p.primary }]}
          testID="manual-submit"
        >
          <Text style={[styles.ctaText, { color: p.onPrimary }]}>Verify</Text>
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  body: { gap: spacing.md, paddingTop: spacing.xxl },
  label: { fontSize: 14, fontWeight: '700' },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    fontSize: 18,
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg - 2,
  },
  errorText: { fontSize: 12, fontWeight: '600' },
  cta: {
    alignItems: 'center',
    borderRadius: radii.pill,
    marginTop: spacing.sm,
    paddingVertical: spacing.lg - 2,
  },
  ctaText: { fontSize: 15, fontWeight: '700' },
});
