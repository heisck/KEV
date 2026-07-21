import { useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionDetail } from '@/api/hooks';
import type { CheckInMethod } from '@/api/schemas';
import { ScreenTopBar } from '@/components/kev/chrome';
import { FaceIdIcon, KeypadIcon, NfcIcon } from '@/components/kev/icons';
import { Avatar, initialsFor } from '@/components/kev/people';
import { StudentReportDrawer, type ReportStudent } from '@/components/reports/StudentReportDrawer';
import { ScanResultPreference } from '@/components/scan/ScanResultPreference';
import { SessionLockButton } from '@/components/scan/SessionLockButton';
import { StudentRosterControls } from '@/components/scan/StudentRosterControls';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned } from '@/data/exams';
import { useScanNavigation } from '@/hooks/useScanNavigation';
import { useStudentRosterFilters } from '@/hooks/useStudentRosterFilters';
import { isPastSession, scanBlockMessage } from '@/lib/sessionLifecycle';
import { allowedScanMethods } from '@/lib/scanMethods';
import { toast } from '@/lib/toast';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, radii, spacing, usePalette, type Palette } from '@/theme';

const buildMethods = (
  p: Palette,
): { key: CheckInMethod; label: string; path: string; icon: ReactNode }[] => [
  { key: 'FACE', label: 'Face', path: '/verify/face', icon: <FaceIdIcon color={p.pink} /> },
  { key: 'NFC', label: 'NFC', path: '/verify/nfc', icon: <NfcIcon color={p.blue} /> },
  {
    key: 'MANUAL',
    label: 'Manual',
    path: '/verify/manual',
    icon: <KeypadIcon color={p.inkSoft} />,
  },
];

/** Scan hub — roster overview, result-page toggle, and the verification methods. */
export function SessionScanScreen() {
  const router = useRouter();
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const sessionId = exam ?? '1';
  const { goBack } = useScanNavigation(sessionId);

  const { data: detail } = useSessionDetail(Number(sessionId) || 1);
  const scanned = useSessionStore((s) => s.roster[sessionId]);
  const defaultScanMethod = useSettingsStore((s) => s.defaultScanMethod);
  const useAllScanMethods = useSettingsStore((s) => s.useAllScanMethods);
  const roster = Array.from(
    new Map(
      [
        ...(scanned ?? []),
        ...(detail?.attendance
          ?.filter((attendance) => attendance.status === 'CHECKED_IN')
          .map((attendance) =>
            studentRecordToScanned(attendance.student, attendance.method, attendance.id),
          ) ?? []),
      ].map((st) => [st.id, st]),
    ).values(),
  );
  const { students, controls } = useStudentRosterFilters(roster);
  const [reportStudent, setReportStudent] = useState<ReportStudent | null>(null);

  // Only the methods this session enabled (fall back to all when unset).
  const allowed = allowedScanMethods(
    detail?.session.verificationMethods,
    useAllScanMethods,
    defaultScanMethod,
  );
  const methods = buildMethods(p)
    .filter((m) => allowed.includes(m.key as (typeof allowed)[number]))
    // Surface the user's default method first.
    .sort((a, b) => Number(b.key === defaultScanMethod) - Number(a.key === defaultScanMethod));
  const scanMessage = detail
    ? scanBlockMessage(detail.session.status)
    : 'Session details are still loading';
  const isPast = isPastSession(detail?.session.status);

  const goTo = (path: string) => {
    if (scanMessage) return toast.info(scanMessage);
    router.push({ pathname: path as never, params: { exam: sessionId } });
  };

  const viewStudent = (student: ReportStudent & { attendanceId?: number; method?: string }) =>
    router.push({
      pathname: '/verify/result',
      params: {
        attendance: String(student.attendanceId ?? ''),
        exam: sessionId,
        method: student.method,
        mode: 'profile',
        status: 'added',
        student: student.id,
      },
    });

  const showStudentActions = (
    student: ReportStudent & { attendanceId?: number; method?: string },
  ) =>
    Alert.alert(student.name, 'Choose an action', [
      { text: 'View student details', onPress: () => viewStudent(student) },
      { text: 'Make report', onPress: () => setReportStudent(student) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar
        title="Scan students"
        onBack={goBack}
        trailing={<SessionLockButton sessionId={sessionId} />}
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: p.ink }]}>Lecturers</Text>
        <View style={styles.lecturers}>
          {(detail?.invigilators ?? []).map((m) => {
            const initials = initialsFor(m.displayName, m.email);
            return (
              <View key={m.userId} style={[styles.addTile, { backgroundColor: p.primary12 }]}>
                <Text style={{ color: p.primary, fontSize: 16, fontWeight: '800' }}>
                  {initials}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.rosterHeader}>
          <Text style={[styles.sectionTitle, { color: p.ink }]}>Students</Text>
          <View style={[styles.counter, { backgroundColor: p.primary12 }]}>
            <Text style={[styles.counterText, { color: p.primary }]}>{roster.length}</Text>
          </View>
        </View>
        <StudentRosterControls {...controls} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roster}
        >
          {students.map((s) => (
            <HapticPressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={`${s.name} result`}
              onLongPress={() => showStudentActions(s)}
              onPress={() => viewStudent(s)}
              style={styles.student}
            >
              <Avatar person={s.person} size={44} />
              <Text numberOfLines={1} style={[styles.studentName, { color: p.inkSoft }]}>
                {s.name}
              </Text>
            </HapticPressable>
          ))}
        </ScrollView>

        {!isPast ? <ScanResultPreference /> : null}

        <View style={[styles.methods, scanMessage && styles.methodsBlocked]}>
          {methods.map((m) => (
            <HapticPressable
              key={m.key}
              accessibilityRole="button"
              accessibilityLabel={`${m.label} verification`}
              onPress={() => goTo(m.path)}
              style={styles.method}
            >
              <View style={[styles.methodCircle, { backgroundColor: p.surfaceDim }]}>{m.icon}</View>
              <Text style={[styles.methodLabel, { color: p.inkSoft }]}>{m.label}</Text>
              {m.key === defaultScanMethod ? (
                <Text style={[styles.methodDefault, { color: p.primary }]}>Default</Text>
              ) : null}
            </HapticPressable>
          ))}
        </View>
        {detail && methods.length === 0 ? (
          <Text style={[styles.noMethods, { color: p.muted }]}>
            Your preferred method is not enabled for this session. Change it in Profile.
          </Text>
        ) : null}
      </ScrollView>
      {reportStudent ? (
        <StudentReportDrawer
          visible
          onClose={() => setReportStudent(null)}
          sessionId={sessionId}
          student={reportStudent}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  body: { gap: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: spacing.xl },
  addTile: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  lecturers: { flexDirection: 'row', gap: spacing.lg },
  rosterHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  counter: {
    backgroundColor: colors.primary12,
    borderRadius: radii.pill,
    minWidth: 26,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  counterText: { color: colors.primary, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  roster: { gap: spacing.md },
  student: { alignItems: 'center', gap: 5, width: 56 },
  studentName: { color: colors.inkSoft, fontSize: 11, fontWeight: '600' },
  methods: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: spacing.sm },
  methodsBlocked: { opacity: 0.45 },
  method: { alignItems: 'center', gap: spacing.sm },
  methodCircle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  methodLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: '600' },
  methodDefault: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  noMethods: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
