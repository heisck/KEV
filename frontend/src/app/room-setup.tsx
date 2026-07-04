import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateSession } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import { RoomSetupScreen, type RoomSetupValues } from '@/screens/RoomSetupScreen';
import { colors, radii, spacing } from '@/theme';

function toIndexRange(courses: RoomSetupValues['courses']): {
  indexRangeStart?: string;
  indexRangeEnd?: string;
} {
  const froms = courses.map((c) => c.indexFrom).filter((v) => v && Number.isFinite(Number(v)));
  const tos = courses.map((c) => c.indexTo).filter((v) => v && Number.isFinite(Number(v)));
  if (froms.length === 0 || tos.length === 0) return {};
  return {
    indexRangeStart: String(Math.min(...froms.map(Number))),
    indexRangeEnd: String(Math.max(...tos.map(Number))),
  };
}

/** Modal wrapping the animated RoomSetupScreen; maps its form into session creation. */
export default function RoomSetupModal() {
  const { top } = useSafeAreaInsets();
  const createSession = useCreateSession();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (values: RoomSetupValues) => {
    if (!values.building) {
      setError('Add a building or college before creating the session.');
      return;
    }
    setError(null);
    const courseCodes = [...new Set(values.courses.map((c) => c.course).filter(Boolean))];
    createSession.mutate(
      {
        building: values.building,
        floor: values.floor,
        room: values.room || undefined,
        courseCodes,
        ...toIndexRange(values.courses),
      },
      {
        onSuccess: (session) => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace({
            pathname: '/(tabs)/sessions/[id]',
            params: { id: String(session.id) },
          });
        },
        onError: (err: unknown) => {
          const detail = getProblemDetail(err);
          setError(detail?.detail ?? detail?.title ?? 'Could not create the session.');
        },
      },
    );
  };

  return (
    <View style={styles.root}>
      <RoomSetupScreen onSubmit={handleSubmit} />
      {error ? (
        <View pointerEvents="none" style={[styles.banner, { top: top + spacing.lg }]}>
          <Text style={styles.bannerText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  banner: {
    alignSelf: 'center',
    backgroundColor: colors.errorSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    position: 'absolute',
  },
  bannerText: { color: colors.error, fontSize: 13, fontWeight: '700' },
});
