import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, ProgressRing } from '@/components/ui';
import { spacing, usePalette } from '@/theme';
import type { RosterIngestStatus } from '@/api/sessions';

type Props = {
  message: string;
  progress: number;
  state: RosterIngestStatus['state'];
  /** Students already committed to the roster; shown so the wait has a visible unit. */
  synced: number;
  embedded: number;
  onRetry: () => void;
  onSkip: () => void;
};

export function RosterLoadingScreen({
  message,
  progress,
  state,
  synced,
  embedded,
  onRetry,
  onSkip,
}: Props) {
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const failed = state === 'FAILED';
  // Skipping is only useful once there is something to scan against; before the first
  // students land it would drop the invigilator into an empty session.
  const canSkip = synced > 0 && state !== 'COMPLETED';

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.xxxl }]}>
      <ProgressRing progress={progress / 100} label="students" size={120} />
      <Text style={[styles.title, { color: p.ink }]}>Loading student information</Text>
      <Text style={[styles.message, { color: failed ? p.error : p.muted }]}>{message}</Text>
      {synced > 0 ? (
        <Text style={[styles.counts, { color: p.muted }]}>
          {synced} synced · {embedded} ready for face scanning
        </Text>
      ) : null}
      <View style={styles.actions}>
        {failed ? <AppButton label="Retry loading" onPress={onRetry} /> : null}
        {canSkip ? (
          <AppButton
            label="Skip and load in background"
            onPress={onSkip}
            variant="ghost"
            testID="roster-skip"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
  counts: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, maxWidth: 300, textAlign: 'center' },
  screen: { alignItems: 'center', flex: 1, gap: spacing.lg, paddingHorizontal: spacing.xl },
  title: { fontSize: 20, fontWeight: '800', marginTop: spacing.md },
});
