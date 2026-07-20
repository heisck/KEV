import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lookupStudent } from '@/api/directory';
import { ScreenTopBar } from '@/components/kev/chrome';
import { ScanMethodSwitcher } from '@/components/scan/ScanMethodSwitcher';
import { SessionLockButton } from '@/components/scan/SessionLockButton';
import { studentRecordToScanned } from '@/data/exams';
import { useMockScan } from '@/hooks/useMockScan';
import { useScanNavigation } from '@/hooks/useScanNavigation';
import { useScanSessionId } from '@/hooks/useScanSession';
import { radii, spacing, usePalette } from '@/theme';

/** Manual verification — type the student's index number. */
export function ManualEntryScreen() {
  const p = usePalette();
  const { bottom, top } = useSafeAreaInsets();
  const sessionId = useScanSessionId();
  const { goBack } = useScanNavigation(sessionId);
  const completeScan = useMockScan(sessionId, 'MANUAL');

  const [index, setIndex] = useState('');
  const [notFound, setNotFound] = useState(false);

  const submit = async () => {
    if (!index.trim()) return;
    try {
      const student = await lookupStudent(index.trim());
      await completeScan(studentRecordToScanned(student));
    } catch {
      setNotFound(true);
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
            Student not found. Check the index number and try again.
          </Text>
        ) : null}
      </View>
      <ScanMethodSwitcher active="MANUAL" sessionId={sessionId} />
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
});
