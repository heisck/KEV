import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionDetail } from '@/api/hooks';
import { CheckCircleIcon, ClockIcon, CloseIcon } from '@/components/kev/icons';
import { Avatar, type PersonKey } from '@/components/kev/people';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned, type ScannedStudent } from '@/data/exams';
import { useSessionStore } from '@/store/sessionStore';
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
  }>();
  const sessionId = params.exam ?? '1';
  const addStudent = useSessionStore((s) => s.addStudent);
  const scanAgainRoute = METHOD_ROUTE[params.method ?? 'MANUAL'] ?? '/verify/manual';

  const { data: detail } = useSessionDetail(Number(sessionId) || 1);
  const studentRec = detail?.attendance?.find(
    (a) => String(a.student.id) === params.student,
  )?.student;
  const student: ScannedStudent = studentRec
    ? studentRecordToScanned(studentRec)
    : {
        id: params.student ?? '1',
        name: 'Ama Serwaa Boateng',
        person: 'freja',
        index: '10953001',
        course: 'BSc Computer Science',
      };

  const [status, setStatus] = useState<Status>(params.status ?? 'review');
  const banners: Record<Status, { text: string; color: string; soft: string }> = {
    added: { text: 'Added to the session', color: p.success, soft: p.successSoft },
    already: { text: 'Student is already in this session', color: p.warn, soft: p.warnSoft },
    review: { text: 'Scanned — review before adding', color: p.primary, soft: p.mint },
  };
  const banner = banners[status];

  const addToClass = () => {
    addStudent(sessionId, student);
    setStatus('added');
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: p.bg, paddingBottom: bottom + spacing.xl, paddingTop: top + spacing.xl },
      ]}
    >
      <View style={styles.center}>
        <Avatar person={student.person as PersonKey} size={112} verified={status === 'added'} />
        <Text style={[styles.name, { color: p.ink }]}>{student.name}</Text>
        <Text style={[styles.meta, { color: p.muted }]}>{student.index}</Text>
        <Text style={[styles.meta, { color: p.muted }]}>{student.course}</Text>

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

        <HapticPressable
          accessibilityRole="button"
          haptic="select"
          onPress={() => router.replace({ pathname: scanAgainRoute, params: { exam: sessionId } })}
          style={[styles.scanAgain, { backgroundColor: p.primary12 }]}
          testID="result-scan-again"
        >
          <Text style={[styles.scanAgainText, { color: p.primary }]}>Scan next student</Text>
        </HapticPressable>
      </View>

      <HapticPressable
        accessibilityRole="button"
        accessibilityLabel="Done scanning"
        onPress={() => router.back()}
        style={[styles.close, { backgroundColor: p.surfaceDim, borderColor: p.hairline }]}
        testID="result-close"
      >
        <CloseIcon color={p.ink} />
      </HapticPressable>
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
    paddingVertical: spacing.lg - 2,
  },
  addButtonText: { fontSize: 15, fontWeight: '700' },
  scanAgain: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: radii.pill,
    marginTop: spacing.md,
    paddingVertical: spacing.lg - 2,
  },
  scanAgainText: { fontSize: 15, fontWeight: '700' },
  close: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
});
