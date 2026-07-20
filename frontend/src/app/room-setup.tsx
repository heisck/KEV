import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateSession } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import type { CreateSessionInput } from '@/api/sessions';
import { CreateSessionWizard } from '@/screens/CreateSessionWizard';
import { radii, spacing, usePalette } from '@/theme';

/** Modal hosting the 5-step create-session wizard; submits straight to the DB. */
export default function RoomSetupModal() {
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const createSession = useCreateSession();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (input: CreateSessionInput) => {
    if (!input.building) {
      setError('Add a building or college before creating the session.');
      return;
    }
    setError(null);
    createSession.mutate(input, {
      onSuccess: (session) => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({ pathname: '/exam/[id]', params: { id: String(session.id) } });
      },
      onError: (err: unknown) => {
        const detail = getProblemDetail(err);
        setError(detail?.detail ?? detail?.title ?? 'Could not create the session.');
      },
    });
  };

  return (
    <View style={styles.root}>
      <CreateSessionWizard
        onSubmit={handleSubmit}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
        submitting={createSession.isPending}
      />
      {error ? (
        <View
          pointerEvents="none"
          style={[styles.banner, { backgroundColor: p.errorSoft, top: top + spacing.lg }]}
        >
          <Text style={[styles.bannerText, { color: p.error }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  banner: {
    alignSelf: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    position: 'absolute',
  },
  bannerText: { fontSize: 13, fontWeight: '700' },
});
