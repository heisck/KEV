import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useEndSession } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import type { SessionDetailDto } from '@/api/schemas';
import { AppButton, Card, ProgressRing, StatusPill } from '@/components/ui';
import { sessionDetailStyles as styles } from '@/screens/sessionDetailStyles';

/** Expected head-count: numeric index range when both bounds parse, else attendance size. */
function expectedCount(detail: SessionDetailDto): number {
  const { indexRangeStart, indexRangeEnd } = detail.session;
  const start = Number(indexRangeStart);
  const end = Number(indexRangeEnd);
  if (indexRangeStart && indexRangeEnd && Number.isFinite(start) && Number.isFinite(end)) {
    return Math.max(1, end - start + 1);
  }
  return Math.max(1, detail.attendance.length);
}

/** Session detail header: serif code, progress ring, counts, scan + end-session actions. */
export function SessionDetailHeader({ detail }: { detail: SessionDetailDto }) {
  const { session, attendance } = detail;
  const endSession = useEndSession(session.id);
  const [endError, setEndError] = useState<string | null>(null);
  const checkedIn = attendance.filter((a) => a.status === 'CHECKED_IN').length;
  const removed = attendance.length - checkedIn;
  const isActive = session.status === 'ACTIVE';

  const handleEnd = () => {
    setEndError(null);
    endSession.mutate(undefined, {
      onSuccess: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      onError: (error: unknown) => {
        const detailBody = getProblemDetail(error);
        setEndError(detailBody?.detail ?? detailBody?.title ?? 'Could not end this session.');
      },
    });
  };

  return (
    <Card style={styles.headerCard}>
      <View style={styles.headerTop}>
        <Text style={styles.code}>{session.sessionCode}</Text>
        <StatusPill label={isActive ? 'Active' : 'Ended'} tone={isActive ? 'success' : 'neutral'} />
      </View>
      <Text style={styles.place}>
        {[session.building, session.floor, session.room].filter(Boolean).join(' · ')}
      </Text>
      <View style={styles.ringRow}>
        <ProgressRing progress={checkedIn / expectedCount(detail)} label="in" />
        <View style={styles.counts}>
          <Text style={styles.countLine}>
            <Text style={styles.countStrong}>{checkedIn}</Text> checked in
          </Text>
          <Text style={styles.countLine}>
            <Text style={styles.countStrong}>{removed}</Text> removed
          </Text>
          <Text style={styles.countLine}>
            <Text style={styles.countStrong}>{detail.invigilators.length}</Text> invigilators
          </Text>
        </View>
      </View>
      {isActive ? (
        <View style={styles.actions}>
          <AppButton
            label="Scan for this session"
            onPress={() => router.push('/(tabs)/scan')}
            testID="detail-scan"
          />
          <AppButton
            label={endSession.isPending ? 'Ending…' : 'End session'}
            variant="danger"
            disabled={endSession.isPending}
            onPress={handleEnd}
            testID="detail-end"
          />
          {endError ? <Text style={styles.errorText}>{endError}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}
