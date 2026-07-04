import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useJoinSession, useSessions } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import type { SessionDto } from '@/api/schemas';
import { DoodleEmpty } from '@/components/doodles/DoodleEmpty';
import {
  AppButton,
  AvatarStack,
  BottomDrawer,
  Card,
  ChipRow,
  EmptyState,
  StatusPill,
} from '@/components/ui';
import { sessionsStyles as styles } from '@/screens/sessionsStyles';
import { colors } from '@/theme';

function openSession(id: number) {
  router.push({ pathname: '/(tabs)/sessions/[id]', params: { id: String(id) } });
}

function SessionCard({ session }: { session: SessionDto }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => openSession(session.id)}>
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.codePill}>
            <Text style={styles.codeText}>{session.sessionCode}</Text>
          </View>
          <StatusPill
            label={session.status === 'ACTIVE' ? 'Active' : 'Ended'}
            tone={session.status === 'ACTIVE' ? 'success' : 'neutral'}
          />
        </View>
        <Text style={styles.place}>
          {[session.building, session.room].filter(Boolean).join(' · ')}
        </Text>
        {session.courseCodes.length > 0 ? (
          <ChipRow labels={session.courseCodes.slice(0, 3)} scrollable={false} />
        ) : null}
        <View style={styles.cardBottom}>
          <AvatarStack urls={Array.from({ length: session.invigilatorCount })} />
          <Text style={styles.checkedIn}>{session.checkedInCount} checked in</Text>
        </View>
      </Card>
    </Pressable>
  );
}

/** All sessions the user runs or invigilates, plus join-by-code and creation entry points. */
export function SessionsScreen() {
  const { top } = useSafeAreaInsets();
  const { data: sessions } = useSessions();
  const join = useJoinSession();
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [code, setCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleJoin = () => {
    setJoinError(null);
    join.mutate(code.trim(), {
      onSuccess: (session) => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsJoinOpen(false);
        setCode('');
        openSession(session.id);
      },
      onError: (error: unknown) => {
        const detail = getProblemDetail(error);
        setJoinError(detail?.detail ?? detail?.title ?? 'Could not join that session.');
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Sessions</Text>
        <Pressable accessibilityRole="button" onPress={() => setIsJoinOpen(true)}>
          <Text style={styles.joinLink}>Join by code</Text>
        </Pressable>
      </View>

      {(sessions ?? []).map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}

      {sessions && sessions.length === 0 ? (
        <EmptyState
          title="No sessions yet"
          message="Create your first exam session or join one with a code."
          illustration={<DoodleEmpty size={110} />}
        />
      ) : null}

      <AppButton
        label="New session"
        variant="ink"
        onPress={() => router.push('/room-setup')}
        style={styles.newSession}
        testID="sessions-new"
      />

      <BottomDrawer visible={isJoinOpen} onClose={() => setIsJoinOpen(false)} title="Join by code">
        <View style={styles.drawerBody}>
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={setCode}
            placeholder="Session code"
            placeholderTextColor={colors.muted}
            style={styles.drawerInput}
            testID="join-code-input"
            value={code}
          />
          {joinError ? <Text style={styles.drawerError}>{joinError}</Text> : null}
          <AppButton
            label={join.isPending ? 'Joining…' : 'Join session'}
            disabled={join.isPending || code.trim().length === 0}
            onPress={handleJoin}
            testID="join-submit"
          />
        </View>
      </BottomDrawer>
    </ScrollView>
  );
}
