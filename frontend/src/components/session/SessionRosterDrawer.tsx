import { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, View } from 'react-native';

import { useRetryRoster, useRosterStatus, useSessionRoster } from '@/api/hooks';
import { isRosterIngestLive, type RosterStudent } from '@/api/sessions';
import { initialsFor } from '@/components/kev/people';
import { AppButton, BottomDrawer } from '@/components/ui';
import { resolveStudentPhotoUrl } from '@/data/exams';
import { radii, spacing, usePalette } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  sessionId: number;
};

function matches(student: RosterStudent, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    student.indexNumber.toLowerCase().includes(q) ||
    student.fullName.toLowerCase().includes(q) ||
    (student.nfcCode?.toLowerCase().includes(q) ?? false)
  );
}

/**
 * The students a session expects, as opposed to the ones already checked in.
 *
 * <p>While the background sync runs, rows stream in and each one shows whether its face
 * data is ready yet, so a partly-synced session is visibly usable rather than looking broken.
 */
export function SessionRosterDrawer({ visible, onClose, sessionId }: Props) {
  const p = usePalette();
  const [query, setQuery] = useState('');
  const status = useRosterStatus(sessionId, visible);
  const live = isRosterIngestLive(status.data?.state);
  const roster = useSessionRoster(visible ? sessionId : 0, live);
  const retry = useRetryRoster();

  const students = useMemo(() => roster.data ?? [], [roster.data]);
  const filtered = useMemo(() => students.filter((s) => matches(s, query)), [students, query]);
  const ready = students.filter((s) => s.faceReady).length;
  // A sync that is no longer running but left students without face data is stuck, not done:
  // the ingest state lives in memory, so a backend restart strands a half-embedded roster
  // with nothing polling for it. Re-running it is the only way out.
  const stalled = !roster.isLoading && !live && ready < students.length;

  return (
    <BottomDrawer
      visible={visible}
      onClose={onClose}
      title="Session roster"
      testID="session-roster-drawer"
    >
      <View style={styles.summaryRow}>
        <View style={[styles.badge, { backgroundColor: p.primary12 }]}>
          <Text style={[styles.badgeText, { color: p.primary }]}>{students.length} students</Text>
        </View>
        <Text style={[styles.summary, { color: p.muted }]}>
          {ready} ready for face scanning
          {live ? ` · loading ${status.data?.progress ?? 0}%` : ''}
        </Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name, index or NFC"
        placeholderTextColor={p.muted}
        autoCapitalize="none"
        style={[styles.search, { backgroundColor: p.input, color: p.ink }]}
        testID="session-roster-search"
      />

      {stalled ? (
        <AppButton
          label={retry.isPending ? 'Reloading…' : `Reload face data for ${students.length - ready}`}
          disabled={retry.isPending}
          onPress={() => retry.mutate(sessionId)}
          variant="ghost"
          testID="roster-reload"
        />
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.indexNumber}
        contentContainerStyle={styles.list}
        style={styles.listBox}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.empty, { color: p.muted }]}>
            {roster.isLoading
              ? 'Loading student information…'
              : students.length === 0
                ? live
                  ? 'Waiting for the first students to arrive from UITS…'
                  : 'No students have been synced for this session yet.'
                : 'No students match that search.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: p.hairline }]}>
            {item.photoUrl ? (
              <Image
                source={{ uri: resolveStudentPhotoUrl(item.photoUrl) }}
                style={[styles.avatar, { backgroundColor: p.surfaceDim }]}
              />
            ) : (
              <View style={[styles.avatar, styles.initials, { backgroundColor: p.primary12 }]}>
                <Text style={[styles.initialsText, { color: p.primary }]}>
                  {initialsFor(item.fullName, null)}
                </Text>
              </View>
            )}
            <View style={styles.rowText}>
              <Text numberOfLines={1} style={[styles.name, { color: p.ink }]}>
                {item.fullName}
              </Text>
              <Text style={[styles.meta, { color: p.muted }]}>
                {item.indexNumber}
                {item.nfcCode ? ` · NFC ${item.nfcCode}` : ''}
              </Text>
            </View>
            {!item.faceReady ? (
              <View style={[styles.pending, { backgroundColor: p.warnSoft }]}>
                <Text style={[styles.pendingText, { color: p.warn }]}>Preparing</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </BottomDrawer>
  );
}

const styles = StyleSheet.create({
  avatar: { borderRadius: 20, height: 40, width: 40 },
  badge: { borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  badgeText: { fontSize: 12, fontWeight: '700' },
  empty: { fontSize: 13, paddingVertical: spacing.xl, textAlign: 'center' },
  initials: { alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 14, fontWeight: '800' },
  list: { gap: spacing.sm, paddingBottom: spacing.sm },
  listBox: { maxHeight: 380 },
  meta: { fontSize: 12, marginTop: 2 },
  name: { fontSize: 15, fontWeight: '700' },
  pending: { borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  pendingText: { fontSize: 11, fontWeight: '700' },
  row: {
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
  },
  rowText: { flex: 1 },
  search: { borderRadius: radii.sm, fontSize: 14, paddingHorizontal: spacing.md, paddingVertical: 10 },
  summary: { fontSize: 12, fontWeight: '600' },
  summaryRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
});
