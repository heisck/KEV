import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateSession, useSessionDetail, useUpdateSession } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import {
  EMPTY_WIZARD_VALUES,
  sessionToWizardValues,
  toCreateInput,
  type WizardValues,
} from '@/components/session/sessionForm';
import { useSessionDraft } from '@/hooks/useSessionDraft';
import { CreateSessionWizard } from '@/screens/CreateSessionWizard';
import { radii, spacing, usePalette } from '@/theme';

/** Modal hosting the 5-step create-session wizard; submits straight to the DB. */
export default function RoomSetupModal() {
  const { sessionId: sessionIdParam } = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = Number(sessionIdParam);
  const editing = Number.isInteger(sessionId) && sessionId > 0;
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const sessionQuery = useSessionDetail(editing ? sessionId : 0);
  const createSession = useCreateSession();
  const updateSession = useUpdateSession(sessionId);
  const draftKey = editing ? `session-draft:edit:${sessionId}` : 'session-draft:create';
  const { clear, draft, ready, save } = useSessionDraft(draftKey);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(() => {
    if (draft) return draft.values;
    if (editing && sessionQuery.data) return sessionToWizardValues(sessionQuery.data.session);
    return EMPTY_WIZARD_VALUES;
  }, [draft, editing, sessionQuery.data]);

  const handleChange = useCallback(
    (values: WizardValues, step: number) => save(values, step),
    [save],
  );

  const handleSubmit = (values: WizardValues) => {
    const input = toCreateInput(values);
    if (!input.building) {
      setError('Add a building or college before saving the session.');
      return;
    }
    setError(null);
    const mutation = editing ? updateSession : createSession;
    mutation.mutate(input, {
      onSuccess: (session) => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        void clear().then(() => {
          router.replace({ pathname: '/exam/[id]', params: { id: String(session.id) } });
        });
      },
      onError: (err: unknown) => {
        const detail = getProblemDetail(err);
        setError(detail?.detail ?? detail?.title ?? 'Could not save the session.');
      },
    });
  };

  const loading = !ready || (editing && sessionQuery.isLoading);
  const loadError = editing && sessionQuery.isError ? 'Could not load this session.' : null;

  return (
    <View style={styles.root}>
      {!loading && !loadError ? (
        <CreateSessionWizard
          initialStep={draft?.step}
          initialValues={initialValues}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          submitLabel={editing ? 'Save changes' : 'Create session'}
          submitting={createSession.isPending || updateSession.isPending}
          title={editing ? 'Edit session' : 'New session'}
        />
      ) : null}
      {error || loadError ? (
        <View
          pointerEvents="none"
          style={[styles.banner, { backgroundColor: p.errorSoft, top: top + spacing.lg }]}
        >
          <Text style={[styles.bannerText, { color: p.error }]}>{error ?? loadError}</Text>
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
