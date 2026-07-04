import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAssignInvigilator, useInvigilators, useSessionReport } from '@/api/hooks';
import { getProblemDetail, isPlanLimitError } from '@/api/schemas';
import { AppButton, ListRow, StatusPill } from '@/components/ui';
import { colors, spacing } from '@/theme';

/** Per-session report: check-in counts by method plus the most recent scans. */
export function ReportSheet({ sessionId }: { sessionId: number }) {
  const { data: report, isLoading } = useSessionReport(sessionId);

  if (isLoading || !report) return <Text style={styles.muted}>Loading report…</Text>;

  return (
    <View style={styles.body}>
      <View style={styles.statRow}>
        <StatusPill label={`${report.checkedIn} checked in`} tone="success" />
        <StatusPill label={`${report.removed} removed`} tone="error" />
      </View>
      {Object.entries(report.byMethod).map(([method, count]) => (
        <View key={method} style={styles.methodRow}>
          <Text style={styles.methodLabel}>{method}</Text>
          <Text style={styles.methodCount}>{count}</Text>
        </View>
      ))}
      <Text style={styles.sectionLabel}>Recent</Text>
      {report.recent.map((a) => (
        <ListRow
          key={a.id}
          title={a.student.fullName}
          subtitle={`${a.student.indexNumber} · ${a.method}`}
          avatarUrl={a.student.photoUrl}
          dimmed={a.status === 'REMOVED'}
        />
      ))}
    </View>
  );
}

/** Assign an invigilator to a session; plan-limit rejections route to the upgrade modal. */
export function AssignSheet({ sessionId, onClose }: { sessionId: number; onClose: () => void }) {
  const { data: invigilators, isLoading } = useInvigilators();
  const assign = useAssignInvigilator(sessionId);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = (userId: string) => {
    setError(null);
    assign.mutate(userId, {
      onError: (err: unknown) => {
        const detail = getProblemDetail(err);
        if (isPlanLimitError(err)) {
          onClose();
          router.push({
            pathname: '/upgrade',
            params: detail?.upgradeHint ? { upgradeHint: detail.upgradeHint } : {},
          });
          return;
        }
        setError(detail?.detail ?? detail?.title ?? 'Could not assign invigilator.');
      },
    });
  };

  if (isLoading || !invigilators) return <Text style={styles.muted}>Loading invigilators…</Text>;

  return (
    <View style={styles.body}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {invigilators.map((user) => (
        <ListRow
          key={user.id}
          title={user.displayName ?? user.email}
          subtitle={user.email}
          avatarUrl={user.pictureUrl ?? undefined}
          trailing={
            <AppButton
              label="Assign"
              variant="ghost"
              disabled={assign.isPending}
              onPress={() => handleAssign(user.id)}
            />
          }
        />
      ))}
      {invigilators.length === 0 ? (
        <Text style={styles.muted}>No invigilators available to assign.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  methodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  methodLabel: { color: colors.inkSoft, fontSize: 14, fontWeight: '600' },
  methodCount: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.sm,
    textTransform: 'uppercase',
  },
  muted: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  error: { color: colors.error, fontSize: 13, textAlign: 'center' },
});
