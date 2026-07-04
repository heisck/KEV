import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRemoveAttendance, useRestoreAttendance, useSessionDetail } from '@/api/hooks';
import type { AttendanceDto } from '@/api/schemas';
import {
  AppButton,
  AvatarStack,
  BottomDrawer,
  Card,
  Chip,
  EmptyState,
  ListRow,
  StatusPill,
} from '@/components/ui';
import { SessionDetailHeader } from '@/screens/SessionDetailHeader';
import { sessionDetailStyles as styles } from '@/screens/sessionDetailStyles';
import { spacing } from '@/theme';

type SessionDetailScreenProps = { sessionId: number };

/** Live session view: header stats + polling attendance feed with remove/restore. */
export function SessionDetailScreen({ sessionId }: SessionDetailScreenProps) {
  const { top } = useSafeAreaInsets();
  const { data: detail, isLoading } = useSessionDetail(sessionId);
  const removeAttendance = useRemoveAttendance(sessionId);
  const restoreAttendance = useRestoreAttendance(sessionId);
  const [pendingRemove, setPendingRemove] = useState<AttendanceDto | null>(null);

  if (isLoading || !detail) {
    return (
      <EmptyState
        title={isLoading ? 'Loading session…' : 'Session not found'}
        testID="detail-loading"
      />
    );
  }

  const confirmRemove = () => {
    if (!pendingRemove) return;
    removeAttendance.mutate(pendingRemove.id, {
      onSuccess: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    });
    setPendingRemove(null);
  };

  const renderItem = ({ item }: { item: AttendanceDto }) => {
    const isRemoved = item.status === 'REMOVED';
    return (
      <Animated.View entering={FadeInDown} layout={LinearTransition}>
        <ListRow
          title={item.student.fullName}
          subtitle={item.student.indexNumber}
          avatarUrl={item.student.photoUrl}
          dimmed={isRemoved}
          onLongPress={isRemoved ? undefined : () => setPendingRemove(item)}
          trailing={
            <View style={styles.rowTrailing}>
              <StatusPill
                label={isRemoved ? 'Removed' : 'Checked in'}
                tone={isRemoved ? 'error' : 'success'}
              />
              {isRemoved ? (
                <AppButton
                  label="Restore"
                  variant="ghost"
                  onPress={() => restoreAttendance.mutate(item.id)}
                />
              ) : (
                <Chip label={item.method} />
              )}
            </View>
          }
        />
      </Animated.View>
    );
  };

  return (
    <>
      <Animated.FlatList
        data={detail.attendance}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        itemLayoutAnimation={LinearTransition}
        contentContainerStyle={[styles.content, { paddingTop: top + spacing.lg }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <SessionDetailHeader detail={detail} />
            <Text style={styles.sectionTitle}>Live feed</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState title="No check-ins yet" message="Scanned students appear here live." />
        }
        ListFooterComponent={
          detail.invigilators.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Invigilators</Text>
              <Card style={styles.invigilatorCard}>
                <AvatarStack urls={detail.invigilators.map((i) => i.pictureUrl ?? undefined)} />
                <Text style={styles.invigilatorNames}>
                  {detail.invigilators
                    .map((i) => i.displayName ?? i.email ?? 'Invigilator')
                    .join(', ')}
                </Text>
              </Card>
            </>
          ) : null
        }
      />

      <BottomDrawer
        visible={pendingRemove !== null}
        onClose={() => setPendingRemove(null)}
        title="Remove student?"
      >
        <View style={styles.drawerBody}>
          <Text style={styles.drawerText}>
            {pendingRemove
              ? `${pendingRemove.student.fullName} (${pendingRemove.student.indexNumber}) will be marked as removed. You can restore them later.`
              : ''}
          </Text>
          <AppButton label="Remove from session" variant="danger" onPress={confirmRemove} />
          <AppButton
            label="Keep checked in"
            variant="ghost"
            onPress={() => setPendingRemove(null)}
          />
        </View>
      </BottomDrawer>
    </>
  );
}
