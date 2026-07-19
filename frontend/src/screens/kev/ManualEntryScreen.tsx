import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenTopBar } from '@/components/kev/chrome';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { SCAN_POOL } from '@/data/exams';
import { useMockScan } from '@/hooks/useMockScan';
import { colors, radii, spacing } from '@/theme';

/** Manual verification — type the student's index number. */
export function ManualEntryScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const completeScan = useMockScan(exam ?? 'ma204');

  const [index, setIndex] = useState('');
  const [notFound, setNotFound] = useState(false);

  const submit = () => {
    const student = SCAN_POOL.find((s) => s.index === index.trim());
    if (student) completeScan(student);
    else setNotFound(true);
  };

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Manual entry" onBack={() => router.back()} />

      <View style={styles.body}>
        <Text style={styles.label}>Index number</Text>
        <TextInput
          value={index}
          onChangeText={(t) => {
            setIndex(t);
            setNotFound(false);
          }}
          onSubmitEditing={submit}
          placeholder="e.g. 4211020"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          returnKeyType="go"
          autoFocus
          style={[styles.input, notFound && styles.inputError]}
          testID="manual-index"
        />
        {notFound ? <Text style={styles.errorText}>No student found with that index.</Text> : null}
        <HapticPressable
          accessibilityRole="button"
          onPress={submit}
          style={styles.cta}
          testID="manual-submit"
        >
          <Text style={styles.ctaText}>Verify</Text>
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  body: { gap: spacing.md, paddingTop: spacing.xxl },
  label: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  input: {
    backgroundColor: colors.surfaceDim,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 18,
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg - 2,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, fontWeight: '600' },
  cta: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    marginTop: spacing.sm,
    paddingVertical: spacing.lg - 2,
  },
  ctaText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
