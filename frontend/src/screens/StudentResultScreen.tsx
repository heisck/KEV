import { isAxiosError } from 'axios';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useCheckIn, useStudentLookup } from '@/api/hooks';
import type { CheckInMethod, FeesStatus } from '@/api/schemas';
import { getProblemDetail } from '@/api/schemas';
import { DoodleCelebrate } from '@/components/doodles/DoodleCelebrate';
import { DoodleEmpty } from '@/components/doodles/DoodleEmpty';
import { VerifiedBadgeIcon } from '@/components/nfc/NfcIcons';
import { FaceVerifyPanel } from '@/components/scan/FaceVerifyPanel';
import { AppButton, Card, EmptyState, StatusPill } from '@/components/ui';
import { studentResultStyles as styles } from '@/screens/studentResultStyles';

const FEES_TONE: Record<FeesStatus, 'success' | 'warn' | 'error'> = {
  PAID: 'success',
  PARTIAL: 'warn',
  OWING: 'error',
};

type StudentResultScreenProps = {
  indexNumber: string;
  sessionId: number;
  method: CheckInMethod;
};

/** Modal result of a scan: directory record, eligibility pills, Mark IN and face verify. */
export function StudentResultScreen({ indexNumber, sessionId, method }: StudentResultScreenProps) {
  const { data: student, isLoading, error } = useStudentLookup(indexNumber);
  const checkIn = useCheckIn(sessionId);
  const [showFace, setShowFace] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [alreadyIn, setAlreadyIn] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const markIn = (usedMethod: CheckInMethod) => {
    setCheckInError(null);
    checkIn.mutate(
      { indexNumber, method: usedMethod },
      {
        onSuccess: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsDone(true);
        },
        onError: (err: unknown) => {
          if (isAxiosError(err) && err.response?.status === 409) {
            setAlreadyIn(true);
            return;
          }
          const detail = getProblemDetail(err);
          setCheckInError(detail?.detail ?? detail?.title ?? 'Check-in failed. Try again.');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
        <View style={styles.skeleton} testID="student-skeleton" />
      </ScrollView>
    );
  }

  if (error || !student) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Not found in directory"
          message={`No student matches “${indexNumber}”.`}
          illustration={<DoodleEmpty size={110} />}
          action={<AppButton label="Back to scan" variant="ghost" onPress={() => router.back()} />}
        />
      </View>
    );
  }

  if (isDone) {
    return (
      <View style={styles.screen}>
        <View style={styles.celebrate}>
          <DoodleCelebrate size={140} />
          <Text style={styles.celebrateTitle}>{student.fullName.split(' ')[0]} is in.</Text>
          <AppButton
            label="Done"
            variant="ink"
            onPress={() => router.back()}
            testID="result-done"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <Card style={styles.card}>
        <Text style={styles.statusLabel}>Student found</Text>
        <View style={styles.photoWrap}>
          <Image source={{ uri: student.photoUrl }} style={styles.photo} contentFit="cover" />
          {student.eligible ? (
            <View style={styles.badge}>
              <VerifiedBadgeIcon />
            </View>
          ) : null}
        </View>
        <Text style={styles.name}>{student.fullName}</Text>
        <Text style={styles.meta}>
          {student.indexNumber} · {student.programme} · Level {student.level}
        </Text>
        <View style={styles.pillRow}>
          <StatusPill
            label={student.enrolled ? 'Enrolled' : 'Not enrolled'}
            tone={student.enrolled ? 'success' : 'error'}
          />
          <StatusPill label={`Fees ${student.feesStatus}`} tone={FEES_TONE[student.feesStatus]} />
          <StatusPill
            label={student.eligible ? 'Eligible' : 'Not eligible'}
            tone={student.eligible ? 'success' : 'error'}
          />
          {alreadyIn ? <StatusPill label="Already checked in" tone="warn" /> : null}
        </View>

        <View style={styles.actions}>
          {checkInError ? <Text style={styles.errorText}>{checkInError}</Text> : null}
          <AppButton
            label={checkIn.isPending ? 'Marking…' : 'Mark IN'}
            disabled={checkIn.isPending || alreadyIn}
            onPress={() => markIn(method)}
            testID="result-mark-in"
          />
          <AppButton
            label={showFace ? 'Hide face verify' : 'Verify face'}
            variant="ghost"
            onPress={() => setShowFace((v) => !v)}
            testID="result-verify-face"
          />
        </View>
      </Card>

      {showFace ? (
        <Card>
          <FaceVerifyPanel indexNumber={student.indexNumber} onMatch={() => markIn('FACE')} />
        </Card>
      ) : null}
    </ScrollView>
  );
}
