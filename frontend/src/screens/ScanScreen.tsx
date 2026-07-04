import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessions } from '@/api/hooks';
import type { CheckInMethod } from '@/api/schemas';
import { DoodleEmpty } from '@/components/doodles/DoodleEmpty';
import { ManualEntryCard } from '@/components/scan/ManualEntryCard';
import { NfcScanPanel } from '@/components/scan/NfcScanPanel';
import { AppButton, Card, ChipRow, EmptyState } from '@/components/ui';
import { getScanCapabilities } from '@/lib/scanCapabilities';
import { colors, spacing, typography } from '@/theme';

type ScanMode = 'NFC' | 'Manual';
const METHOD_BY_MODE: Record<ScanMode, CheckInMethod> = { NFC: 'NFC', Manual: 'MANUAL' };

/** Check-in screen: NFC card taps with manual index entry as the fallback. */
export function ScanScreen() {
  const { top } = useSafeAreaInsets();
  const { data: sessions } = useSessions();
  const [hasNfc, setHasNfc] = useState<boolean | null>(null);
  const [mode, setMode] = useState<ScanMode>('Manual');
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    void getScanCapabilities().then((caps) => {
      if (!mounted) return;
      setHasNfc(caps.nfc);
      setMode(caps.nfc ? 'NFC' : 'Manual');
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeSessions = useMemo(
    () => (sessions ?? []).filter((s) => s.status === 'ACTIVE'),
    [sessions],
  );
  const selectedSession =
    activeSessions.find((s) => s.id === sessionId) ?? activeSessions[0] ?? null;

  const modes = useMemo<ScanMode[]>(() => (hasNfc ? ['NFC', 'Manual'] : ['Manual']), [hasNfc]);

  const handleIndexNumber = useCallback(
    (indexNumber: string) => {
      if (!selectedSession) return;
      router.push({
        pathname: '/student-result',
        params: {
          indexNumber,
          sessionId: String(selectedSession.id),
          method: METHOD_BY_MODE[mode],
        },
      });
    },
    [mode, selectedSession],
  );

  if (sessions && activeSessions.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: top + spacing.lg }]}>
        <Text style={styles.title}>Scan</Text>
        <EmptyState
          title="No active session"
          message="Check-ins need a live exam session. Create one to start scanning."
          illustration={<DoodleEmpty size={110} />}
          action={<AppButton label="Create session" onPress={() => router.push('/room-setup')} />}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.lg }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Scan</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Session</Text>
        <ChipRow
          labels={activeSessions.map((s) => s.sessionCode)}
          activeLabel={selectedSession?.sessionCode}
          onSelect={(code) => {
            const match = activeSessions.find((s) => s.sessionCode === code);
            if (match) setSessionId(match.id);
          }}
        />
      </View>

      {hasNfc ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Method</Text>
          <ChipRow
            labels={modes}
            activeLabel={mode}
            onSelect={(label) => {
              if (label === 'NFC' || label === 'Manual') setMode(label);
            }}
            scrollable={false}
          />
        </View>
      ) : null}

      {hasNfc === false ? (
        <Card variant="mint" style={styles.nfcNote}>
          <DoodleEmpty size={64} />
          <Text style={styles.nfcNoteText}>
            NFC needs the dev build — enter the index number below instead.
          </Text>
        </Card>
      ) : null}

      {mode === 'NFC' ? <NfcScanPanel onIndexNumber={handleIndexNumber} /> : null}
      {mode === 'Manual' ? <ManualEntryCard onSubmit={handleIndexNumber} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  content: { gap: spacing.xl, paddingBottom: 120, paddingHorizontal: spacing.xl },
  title: { color: colors.ink, fontFamily: typography.display, fontSize: 28 },
  section: { gap: spacing.sm },
  sectionLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  nfcNote: { alignItems: 'center', flexDirection: 'row', gap: spacing.lg },
  nfcNoteText: { color: colors.inkSoft, flex: 1, fontSize: 13, lineHeight: 19 },
});
