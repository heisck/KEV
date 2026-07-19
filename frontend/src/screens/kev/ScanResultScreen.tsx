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
import { colors, radii, spacing } from '@/theme';

type Status = 'added' | 'already' | 'review';

const BANNERS: Record<Status, { text: string; color: string; soft: string }> = {
  added: { text: 'Added to the session', color: colors.success, soft: colors.successSoft },
  already: {
    text: 'Student is already in this session',
    color: colors.warn,
    soft: colors.warnSoft,
  },
  review: { text: 'Scanned — review before adding', color: colors.primary, soft: colors.mint },
};

/** Scan result — student identity with add/close actions (X closes, bottom center). */
export function ScanResultScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ exam?: string; student?: string; status?: Status }>();
  const sessionId = params.exam ?? '1';
  const addStudent = useSessionStore((s) => s.addStudent);

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
  const banner = BANNERS[status];

  const addToClass = () => {
    addStudent(sessionId, student);
    setStatus('added');
  };

  return (
    <View
      style={[styles.screen, { paddingBottom: bottom + spacing.xl, paddingTop: top + spacing.xl }]}
    >
      <View style={styles.center}>
        <Avatar person={student.person as PersonKey} size={112} verified={status === 'added'} />
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.meta}>{student.index}</Text>
        <Text style={styles.meta}>{student.course}</Text>

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
            style={styles.addButton}
            testID="result-add"
          >
            <Text style={styles.addButtonText}>Add to class</Text>
          </HapticPressable>
        ) : null}
      </View>

      <HapticPressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={() => router.back()}
        style={styles.close}
        testID="result-close"
      >
        <CloseIcon color={colors.ink} />
      </HapticPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  center: { alignItems: 'center', flex: 1, gap: 6, justifyContent: 'center' },
  name: { color: colors.ink, fontSize: 24, fontWeight: '800', marginTop: spacing.lg },
  meta: { color: colors.muted, fontSize: 14, fontWeight: '500' },
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
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg - 2,
  },
  addButtonText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  close: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surfaceDim,
    borderColor: colors.hairline,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
});
