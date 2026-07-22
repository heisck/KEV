import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lookupStudent } from '@/api/directory';
import { ScreenTopBar } from '@/components/kev/chrome';
import { ScanMethodSwitcher } from '@/components/scan/ScanMethodSwitcher';
import { SessionLockButton } from '@/components/scan/SessionLockButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned } from '@/data/exams';
import { useScanCheckIn } from '@/hooks/useScanCheckIn';
import { useScanMethodGuard } from '@/hooks/useScanMethodGuard';
import { useScanNavigation } from '@/hooks/useScanNavigation';
import { useScanSessionId } from '@/hooks/useScanSession';
import { radii, spacing, usePalette } from '@/theme';

/** Manual verification — type the student's index number. */
export function ManualEntryScreen() {
  const p = usePalette();
  const { bottom, top } = useSafeAreaInsets();
  const sessionId = useScanSessionId();
  const { goBack } = useScanNavigation(sessionId);
  const completeScan = useScanCheckIn(sessionId, 'MANUAL');
  const { allowedMethods, canUse } = useScanMethodGuard(sessionId, 'MANUAL');

  const [index, setIndex] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!canUse || !index.trim() || submitting) return;
    setSubmitting(true);
    try {
      const student = await lookupStudent(index.trim());
      await completeScan(studentRecordToScanned(student));
    } catch {
      setNotFound(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: p.bg, paddingBottom: bottom + spacing.lg, paddingTop: top + spacing.md },
      ]}
    >
      <ScreenTopBar
        title="Manual entry"
        onBack={goBack}
        trailing={<SessionLockButton sessionId={sessionId} />}
      />

      <View style={styles.body}>
        <Text style={[styles.label, { color: p.ink }]}>Index number</Text>
        <TextInput
          value={index}
          onChangeText={(t) => {
            setIndex(t);
            setNotFound(false);
          }}
          placeholder="e.g. 4211020"
          placeholderTextColor={p.muted}
          keyboardType="number-pad"
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
            Student not found. Check the index number and try again.
          </Text>
        ) : null}
      </View>
      <HapticPressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canUse || submitting || !index.trim() }}
        disabled={!canUse || submitting || !index.trim()}
        haptic="select"
        onPress={submit}
        style={[
          styles.sendButton,
          { backgroundColor: p.primary },
          (!canUse || submitting || !index.trim()) && styles.disabled,
        ]}
        testID="manual-send"
      >
        <Text style={[styles.sendText, { color: p.onPrimary }]}>
          {submitting ? 'Sending…' : 'Send'}
        </Text>
      </HapticPressable>
      <ScanMethodSwitcher active="MANUAL" sessionId={sessionId} allowedMethods={allowedMethods} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  body: { flex: 1, gap: spacing.md, paddingTop: spacing.xxl },
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
  sendButton: {
    alignItems: 'center',
    borderRadius: radii.pill,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  sendText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
