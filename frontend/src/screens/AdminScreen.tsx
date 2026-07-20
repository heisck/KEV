import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAdminSessions } from '@/api/hooks';
import type { SessionDto } from '@/api/schemas';
import { DoodleEmpty } from '@/components/doodles/DoodleEmpty';
import { AppButton, BottomDrawer, Card, Chip, EmptyState, StatusPill } from '@/components/ui';
import { AssignSheet, ReportSheet } from '@/screens/AdminSheets';
import { useAuthStore } from '@/store/authStore';
import { spacing, typography, usePalette } from '@/theme';

type Sheet = { kind: 'report' | 'assign'; sessionId: number } | null;

function AdminSessionCard({
  session,
  onReport,
  onAssign,
}: {
  session: SessionDto;
  onReport: () => void;
  onAssign: () => void;
}) {
  const p = usePalette();
  return (
    <Pressable accessibilityRole="button" onPress={onReport}>
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardCode, { color: p.ink }]}>{session.sessionCode}</Text>
          <StatusPill
            label={session.status === 'ACTIVE' ? 'Active' : 'Ended'}
            tone={session.status === 'ACTIVE' ? 'success' : 'neutral'}
          />
        </View>
        <Text style={[styles.cardMeta, { color: p.muted }]}>
          {session.checkedInCount} checked in · {session.invigilatorCount} invigilators
        </Text>
        <AppButton label="Assign invigilators" variant="ghost" onPress={onAssign} />
      </Card>
    </Pressable>
  );
}

/** Admin console: session reports and invigilator assignment (plan-gated). */
export function AdminScreen() {
  const user = useAuthStore((s) => s.user);

  // Guard BEFORE any admin query runs — non-admins must never hit /api/admin/*.
  if (user?.role !== 'ADMIN') {
    return (
      <EmptyState
        title="Admins only"
        message="This area is reserved for administrators."
        illustration={<DoodleEmpty size={110} />}
      />
    );
  }

  return <AdminContent plan={user.plan} />;
}

function AdminContent({ plan }: { plan: 'FREE' | 'PREMIUM' }) {
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const { data: sessions } = useAdminSessions();
  const [sheet, setSheet] = useState<Sheet>(null);

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: p.ink }]}>Admin</Text>
          <Chip label={plan} active={plan === 'PREMIUM'} />
        </View>

        <Text style={[styles.sectionLabel, { color: p.muted }]}>Sessions</Text>
        {(sessions ?? []).map((session) => (
          <AdminSessionCard
            key={session.id}
            session={session}
            onReport={() => setSheet({ kind: 'report', sessionId: session.id })}
            onAssign={() => setSheet({ kind: 'assign', sessionId: session.id })}
          />
        ))}
        {sessions && sessions.length === 0 ? (
          <EmptyState
            title="No sessions"
            message="Sessions appear here once lecturers create them."
          />
        ) : null}
      </ScrollView>

      <BottomDrawer
        visible={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet?.kind === 'assign' ? 'Assign invigilators' : 'Session report'}
      >
        {sheet?.kind === 'report' ? <ReportSheet sessionId={sheet.sessionId} /> : null}
        {sheet?.kind === 'assign' ? (
          <AssignSheet sessionId={sheet.sessionId} onClose={() => setSheet(null)} />
        ) : null}
      </BottomDrawer>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: 120, paddingHorizontal: spacing.xl },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontFamily: typography.display, fontSize: 28 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  card: { gap: spacing.md },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  cardCode: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  cardMeta: { fontSize: 13 },
});
