import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRemoveAttendance, useSessionDetail } from '@/api/hooks';
import { BackIcon, CheckCircleIcon, ClockIcon, CloseIcon, DocIcon } from '@/components/kev/icons';
import { Avatar } from '@/components/kev/people';
import { StudentReportDrawer } from '@/components/reports/StudentReportDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned, type ScannedStudent } from '@/data/exams';
import { toast } from '@/lib/toast';
import { allowedScanMethods } from '@/lib/scanMethods';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing, usePalette } from '@/theme';

type Status = 'added' | 'already' | 'review';

const METHOD_ROUTE: Record<string, '/verify/face' | '/verify/nfc' | '/verify/manual'> = {
  FACE: '/verify/face',
  NFC: '/verify/nfc',
  MANUAL: '/verify/manual',
};

/** Scan result — student identity with add / scan-again / close actions. */
export function ScanResultScreen() {
  const p = usePalette();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    exam?: string;
    student?: string;
    status?: Status;
    method?: string;
    mode?: 'profile';
    attendance?: string;
  }>();
  const lockedSessionId = useSessionStore((state) => state.lockedSessionId);
  const sessionId = params.exam ?? lockedSessionId ?? '1';
  const addStudent = useSessionStore((s) => s.addStudent);
  const removeStudent = useSessionStore((state) => state.removeStudent);
  const localStudent = useSessionStore((state) =>
    state.roster[sessionId]?.find((student) => student.id === params.student),
  );
  const preferredMethod = useSettingsStore((state) => state.defaultScanMethod);
  const useAllScanMethods = useSettingsStore((state) => state.useAllScanMethods);
  const profileMode = params.mode === 'profile';
  const removeMutation = useRemoveAttendance(Number(sessionId) || 1);

  const { data: detail } = useSessionDetail(Number(sessionId) || 1);
  const allowed = allowedScanMethods(
    detail?.session.verificationMethods,
    useAllScanMethods,
    preferredMethod,
  );
  const nextMethod = allowed.includes(params.method as (typeof allowed)[number])
    ? params.method
    : allowed[0];
  const scanAgainRoute = nextMethod ? METHOD_ROUTE[nextMethod] : '/verify';
  const attendance = detail?.attendance?.find((a) => String(a.student.id) === params.student);
  const student: ScannedStudent = attendance
    ? studentRecordToScanned(attendance.student, attendance.method, attendance.id)
    : (localStudent ?? {
        id: params.student ?? '1',
        name: 'Student',
        person: 'me',
        index: 'Profile unavailable',
        course: '',
      });

  const [statusOverride, setStatus] = useState<Status | null>(params.status ?? null);
  const [reportOpen, setReportOpen] = useState(false);
  const status = statusOverride ?? (attendance || localStudent ? 'added' : 'review');
  const banners: Record<Status, { text: string; color: string; soft: string }> = {
    added: { text: 'Added to the session', color: p.success, soft: p.successSoft },
    already: { text: 'Student already in this class', color: p.ink, soft: p.warnSoft },
    review: { text: 'Scanned. Review before adding', color: p.primary, soft: p.mint },
  };
  const banner = banners[status];
  const attendanceId = Number(params.attendance) || student.attendanceId;

  const addToClass = () => {
    addStudent(sessionId, student);
    setStatus('added');
  };

  const removeFromClass = async () => {
    if (!attendanceId) return toast.error('Could not find this attendance record');
    try {
      await removeMutation.mutateAsync(attendanceId);
      removeStudent(sessionId, student.id);
      toast.success('Student removed from class');
      router.back();
    } catch {
      toast.error('Could not remove student. Try again');
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: p.bg, paddingBottom: bottom + spacing.xl, paddingTop: top + spacing.xl },
      ]}
    >
      <HapticPressable
        accessibilityLabel="Make a report about this student"
        accessibilityRole="button"
        haptic="select"
        onPress={() => setReportOpen(true)}
        style={[styles.reportButton, { backgroundColor: p.surfaceDim }]}
      >
        <DocIcon color={p.primary} size={20} />
      </HapticPressable>
      <View style={styles.center}>
        <Avatar person={student.person} size={112} verified={status === 'added'} />
        <Text style={[styles.name, { color: p.ink }]}>{student.name}</Text>
        <Text style={[styles.meta, { color: p.muted }]}>{student.index}</Text>
        {student.course ? (
          <Text style={[styles.meta, { color: p.muted }]}>{student.course}</Text>
        ) : null}

        <View style={[styles.banner, { backgroundColor: banner.soft }]}>
          {status === 'review' ? (
            <ClockIcon color={banner.color} size={15} />
          ) : (
            <CheckCircleIcon color={banner.color} size={17} />
          )}
          <Text style={[styles.bannerText, { color: banner.color }]}>{banner.text}</Text>
        </View>

        {status === 'review' ? (
          <HapticPressable
            accessibilityRole="button"
            onPress={addToClass}
            style={[styles.addButton, { backgroundColor: p.primary }]}
            testID="result-add"
          >
            <Text style={[styles.addButtonText, { color: p.onPrimary }]}>Add to class</Text>
          </HapticPressable>
        ) : null}
      </View>

      <View style={styles.actions}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel={profileMode ? 'Back to session' : 'Done scanning'}
          onPress={() => router.back()}
          style={[styles.close, { backgroundColor: p.surfaceDim, borderColor: p.hairline }]}
          testID="result-close"
        >
          {profileMode ? <BackIcon color={p.ink} /> : <CloseIcon color={p.ink} />}
        </HapticPressable>
        {profileMode ? (
          <HapticPressable
            accessibilityRole="button"
            disabled={removeMutation.isPending}
            haptic="warning"
            onPress={removeFromClass}
            style={[styles.scanAgain, { backgroundColor: p.error }]}
            testID="result-remove"
          >
            <Text style={[styles.scanAgainText, { color: p.onPrimary }]}>
              {removeMutation.isPending ? 'Removing...' : 'Remove from class'}
            </Text>
          </HapticPressable>
        ) : (
          <HapticPressable
            accessibilityRole="button"
            haptic="select"
            onPress={() =>
              router.replace({ pathname: scanAgainRoute, params: { exam: sessionId } })
            }
            style={[styles.scanAgain, { backgroundColor: p.primary }]}
            testID="result-scan-again"
          >
            <Text style={[styles.scanAgainText, { color: p.onPrimary }]}>Next student</Text>
          </HapticPressable>
        )}
      </View>
      {reportOpen ? (
        <StudentReportDrawer
          visible
          onClose={() => setReportOpen(false)}
          sessionId={sessionId}
          student={student}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  center: { alignItems: 'center', flex: 1, gap: 6, justifyContent: 'center' },
  name: { fontSize: 24, fontWeight: '800', marginTop: spacing.lg },
  meta: { fontSize: 14, fontWeight: '500' },
  banner: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  bannerText: { fontSize: 13, fontWeight: '700' },
  addButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: radii.pill,
    marginTop: spacing.xl,
    height: 56,
    justifyContent: 'center',
  },
  addButtonText: { fontSize: 15, fontWeight: '700' },
  scanAgain: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
  scanAgainText: { fontSize: 15, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.md },
  close: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  reportButton: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xl,
    top: spacing.xl,
    width: 44,
    zIndex: 1,
  },
});
