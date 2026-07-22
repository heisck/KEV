import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAdminsList, useAdminSessions, useLecturersList } from '@/api/hooks';
import type { SessionDto, UserDto } from '@/api/schemas';
import { DoodleEmpty } from '@/components/doodles/DoodleEmpty';
import {
  AppButton,
  BottomDrawer,
  Card,
  Chip,
  EmptyState,
  ListRow,
  StatusPill,
} from '@/components/ui';
import { CreateAdminSheet } from '@/screens/CreateAdminSheet';
import { CreateLecturerSheet } from '@/screens/CreateLecturerSheet';
import { AssignSheet, ReportSheet } from '@/screens/AdminSheets';
import { useAuthStore } from '@/store/authStore';
import { spacing, typography, usePalette } from '@/theme';

type Sheet =
  | { kind: 'report' | 'assign'; sessionId: number }
  | { kind: 'createLecturer' }
  | { kind: 'createAdmin' }
  | null;

type AdminTab = 'lecturers' | 'admins' | 'sessions';

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

/** Admin console: lecturer management, admin management, and session invigilator assignment. */
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
  const [activeTab, setActiveTab] = useState<AdminTab>('lecturers');
  const [sheet, setSheet] = useState<Sheet>(null);

  const { data: sessions } = useAdminSessions();
  const { data: lecturers } = useLecturersList();
  const { data: admins } = useAdminsList();

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

        {/* Tab switcher */}
        <View style={[styles.tabBar, { backgroundColor: p.surface }]}>
          {(['lecturers', 'admins', 'sessions'] as AdminTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && { backgroundColor: p.primary }]}
              >
                <Text style={[styles.tabButtonText, { color: isActive ? p.onPrimary : p.muted }]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Lecturers Tab */}
        {activeTab === 'lecturers' ? (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: p.muted }]}>
                Lecturers ({lecturers?.length ?? 0})
              </Text>
              <AppButton
                label="+ Add Lecturer"
                variant="ghost"
                onPress={() => setSheet({ kind: 'createLecturer' })}
              />
            </View>
            {(lecturers ?? []).map((l: UserDto) => (
              <ListRow
                key={l.id}
                title={l.displayName ?? l.email}
                subtitle={`${l.lecturerId ?? 'ID N/A'} · ${l.email}${l.phone ? ' · ' + l.phone : ''}`}
                avatarUrl={l.pictureUrl ?? undefined}
                trailing={
                  <StatusPill
                    label={l.active ? 'Active' : 'Disabled'}
                    tone={l.active ? 'success' : 'error'}
                  />
                }
              />
            ))}
            {lecturers && lecturers.length === 0 ? (
              <EmptyState
                title="No lecturers"
                message="Click '+ Add Lecturer' to onboard your first lecturer."
              />
            ) : null}
          </View>
        ) : null}

        {/* Admins Tab */}
        {activeTab === 'admins' ? (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: p.muted }]}>
                Administrators ({admins?.length ?? 0})
              </Text>
              <AppButton
                label="+ Add Admin"
                variant="ghost"
                onPress={() => setSheet({ kind: 'createAdmin' })}
              />
            </View>
            {(admins ?? []).map((a: UserDto) => (
              <ListRow
                key={a.id}
                title={a.displayName ?? a.email}
                subtitle={a.email}
                avatarUrl={a.pictureUrl ?? undefined}
                trailing={<StatusPill label="Admin" tone="neutral" />}
              />
            ))}
            {admins && admins.length === 0 ? (
              <EmptyState
                title="No admins"
                message="Click '+ Add Admin' to assign another admin."
              />
            ) : null}
          </View>
        ) : null}

        {/* Sessions Tab */}
        {activeTab === 'sessions' ? (
          <View style={styles.tabSection}>
            <Text style={[styles.sectionLabel, { color: p.muted }]}>
              Sessions ({sessions?.length ?? 0})
            </Text>
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
          </View>
        ) : null}
      </ScrollView>

      <BottomDrawer
        visible={sheet !== null}
        onClose={() => setSheet(null)}
        title={
          sheet?.kind === 'assign'
            ? 'Assign invigilators'
            : sheet?.kind === 'report'
              ? 'Session report'
              : sheet?.kind === 'createLecturer'
                ? 'Add New Lecturer'
                : sheet?.kind === 'createAdmin'
                  ? 'Add New Administrator'
                  : ''
        }
      >
        {sheet?.kind === 'report' ? <ReportSheet sessionId={sheet.sessionId} /> : null}
        {sheet?.kind === 'assign' ? (
          <AssignSheet sessionId={sheet.sessionId} onClose={() => setSheet(null)} />
        ) : null}
        {sheet?.kind === 'createLecturer' ? (
          <CreateLecturerSheet onClose={() => setSheet(null)} />
        ) : null}
        {sheet?.kind === 'createAdmin' ? <CreateAdminSheet onClose={() => setSheet(null)} /> : null}
      </BottomDrawer>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: 120, paddingHorizontal: spacing.xl },
  headerRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontFamily: typography.display, fontSize: 28 },
  tabBar: {
    borderRadius: 20,
    flexDirection: 'row',
    padding: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 16,
    flex: 1,
    paddingVertical: 10,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabSection: { gap: spacing.md },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
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
