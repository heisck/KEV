import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useJoinSession, useSessionDetail } from '@/api/hooks';
import { SceneArt } from '@/components/kev/art';
import { BlueChip, ScreenTopBar } from '@/components/kev/chrome';
import {
  ChevronRightIcon,
  FaceIdIcon,
  KeypadIcon,
  NfcIcon,
  SendIcon,
} from '@/components/kev/icons';
import { Avatar } from '@/components/kev/people';
import { ScanResultPreference } from '@/components/scan/ScanResultPreference';
import { StudentRosterControls } from '@/components/scan/StudentRosterControls';
import { SessionActionsMenu } from '@/components/session/SessionActionsMenu';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned } from '@/data/exams';
import { useStudentRosterFilters } from '@/hooks/useStudentRosterFilters';
import { isPastSession, scanBlockMessage } from '@/lib/sessionLifecycle';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import { useSessionStore } from '@/store/sessionStore';
import { colors, spacing, usePalette } from '@/theme';
import { makeGroupSessionStyles } from '@/screens/kev/groupSessionStyles';

const METHODS = [
  { label: 'Face', icon: <FaceIdIcon color={colors.pink} />, path: '/verify/face' as const },
  { label: 'NFC', icon: <NfcIcon color={colors.blue} />, path: '/verify/nfc' as const },
  { label: 'Manual', icon: <KeypadIcon color={colors.inkSoft} />, path: '/verify/manual' as const },
] as const;

/** Ongoing session — join via password, lecturers + live student roster (kev mockup screen 3). */
export function GroupSessionScreen() {
  const router = useRouter();
  const p = usePalette();
  const styles = makeGroupSessionStyles(p);
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const sessionId = exam ?? '1';

  const { data: detail } = useSessionDetail(Number(sessionId) || 1);
  const joinMutation = useJoinSession();
  const userId = useAuthStore((state) => state.user?.id);
  const chatPeerId = detail?.invigilators.find((member) => member.userId !== userId)?.userId;

  const joined = detail?.invigilators.some((member) => member.userId === userId) ?? false;
  const scanned = useSessionStore((s) => s.roster[sessionId]);
  // Merge DB attendance with the local scan roster, de-duplicating by id.
  const roster = Array.from(
    new Map(
      [
        ...(scanned ?? []),
        ...(detail?.attendance
          ?.filter((attendance) => attendance.status === 'CHECKED_IN')
          .map((attendance) =>
            studentRecordToScanned(attendance.student, attendance.method, attendance.id),
          ) ?? []),
      ].map((st) => [st.id, st]),
    ).values(),
  );
  const { students, controls } = useStudentRosterFilters(roster);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const scanMessage = detail
    ? scanBlockMessage(detail.session.status)
    : 'Session details are loading';

  const openMethod = (path: (typeof METHODS)[number]['path']) => {
    if (scanMessage) return toast.info(scanMessage);
    router.push({ pathname: path, params: { exam: sessionId } });
  };

  const submitCode = async () => {
    if (!code.trim()) return;
    try {
      const session = await joinMutation.mutateAsync(code.trim());
      const joinedId = String(session.id);
      setDrawerOpen(false);
      setCode('');
      setError(false);
      if (joinedId !== sessionId) {
        router.replace({ pathname: '/group-session', params: { exam: joinedId } });
      }
    } catch {
      setError(true);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <ScreenTopBar
        title="Group Session"
        onBack={() => router.replace('/(tabs)')}
        trailing={
          <SessionActionsMenu
            code={detail?.session.sessionCode}
            password={detail?.session.sessionPassword ?? detail?.session.sessionCode}
            lecturers={detail?.invigilators ?? []}
            joined={joined}
            onJoin={() => setDrawerOpen(true)}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {joined ? (
          <>
            <StudentRosterControls {...controls} />
            <View style={[styles.rosterSection, { minHeight: height * 0.3 }]}>
              <View style={styles.rosterHeader}>
                <Text style={styles.rosterTitle}>Students</Text>
                <View style={styles.counter}>
                  <Text style={styles.counterText}>{students.length}</Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.roster}
              >
                {students.map((s) => (
                  <HapticPressable
                    key={s.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${s.name} result`}
                    onPress={() =>
                      router.push({
                        pathname: '/verify/result',
                        params: {
                          attendance: String(s.attendanceId ?? ''),
                          exam: sessionId,
                          mode: 'profile',
                          status: 'added',
                          student: s.id,
                        },
                      })
                    }
                    style={styles.student}
                  >
                    <Avatar person={s.person} size={72} />
                    <Text numberOfLines={2} style={styles.studentName}>
                      {s.name}
                    </Text>
                  </HapticPressable>
                ))}
              </ScrollView>
            </View>
            <View style={styles.sectionDivider} />
            {!isPastSession(detail?.session.status) ? <ScanResultPreference /> : null}

            <View style={styles.methods}>
              {METHODS.map((m) => (
                <HapticPressable
                  key={m.label}
                  accessibilityRole="button"
                  accessibilityLabel={`${m.label} verification`}
                  onPress={() => openMethod(m.path)}
                  style={[styles.method, scanMessage && styles.methodDisabled]}
                >
                  <View style={styles.methodCircle}>{m.icon}</View>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                </HapticPressable>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.joinPrompt}>
            <Text style={styles.rosterTitle}>Join this session to scan students</Text>
            <HapticPressable
              accessibilityRole="button"
              onPress={() => setDrawerOpen(true)}
              style={styles.joinButton}
            >
              <Text style={styles.joinButtonText}>Enter session password</Text>
            </HapticPressable>
          </View>
        )}

        <View style={styles.rowCard}>
          <View style={styles.thumb}>
            <SceneArt art="arena" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Share my report</Text>
            <Text style={styles.rowSub}>+ Add note</Text>
          </View>
          <BlueChip
            label="Post"
            icon={<SendIcon color={p.blue} />}
            onPress={() =>
              chatPeerId
                ? router.push({ pathname: '/chat/[id]', params: { id: chatPeerId } })
                : router.push('/(tabs)/chat')
            }
          />
        </View>

        <View style={styles.rowCard}>
          <View style={styles.tallThumb}>
            <SceneArt art="students" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Find invigilators</Text>
            <Text style={styles.rowSub}>Explore available staff for your session</Text>
            <HapticPressable
              accessibilityRole="button"
              onPress={() => router.push('/invigilators')}
              style={styles.explore}
            >
              <Text style={styles.exploreText}>Explore</Text>
              <ChevronRightIcon color={p.primary} size={13} />
            </HapticPressable>
          </View>
        </View>
      </ScrollView>

      <BottomDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Join session"
        testID="join-session-drawer"
      >
        <Text style={styles.drawerHint}>Enter the session password to join.</Text>
        <TextInput
          value={code}
          onChangeText={(text) => {
            setCode(text);
            setError(false);
          }}
          onSubmitEditing={submitCode}
          placeholder="Session password"
          placeholderTextColor={p.muted}
          autoFocus
          autoCapitalize="none"
          returnKeyType="go"
          style={[styles.input, error && styles.inputError]}
          testID="join-session-code"
        />
        {error ? <Text style={styles.errorText}>Wrong password. Try again.</Text> : null}
        <HapticPressable
          accessibilityRole="button"
          onPress={submitCode}
          style={styles.joinButton}
          testID="join-session-submit"
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </HapticPressable>
      </BottomDrawer>
    </View>
  );
}
