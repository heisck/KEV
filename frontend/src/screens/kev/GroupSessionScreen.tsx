import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useJoinSession, useSessionDetail } from '@/api/hooks';
import { SceneArt } from '@/components/kev/art';
import { BlueChip, CircleButton, ScreenTopBar } from '@/components/kev/chrome';
import {
  CheckCircleIcon,
  ChevronRightIcon,
  FaceIdIcon,
  KeypadIcon,
  NfcIcon,
  PlusIcon,
  ScanFrameIcon,
  SendIcon,
  StepsIcon,
} from '@/components/kev/icons';
import { Avatar } from '@/components/kev/people';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned } from '@/data/exams';
import { useSessionStore } from '@/store/sessionStore';
import { colors, radii, spacing } from '@/theme';

const METHODS = [
  { label: 'Face', icon: <FaceIdIcon color={colors.pink} />, path: '/verify/face' as const },
  { label: 'NFC', icon: <NfcIcon color={colors.blue} />, path: '/verify/nfc' as const },
  { label: 'Manual', icon: <KeypadIcon color={colors.inkSoft} />, path: '/verify/manual' as const },
] as const;

/** Ongoing session — join via password, lecturers + live student roster (kev mockup screen 3). */
export function GroupSessionScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const sessionId = exam ?? '1';

  const { data: detail } = useSessionDetail(Number(sessionId) || 1);
  const joinMutation = useJoinSession();

  const joined =
    useSessionStore((s) => Boolean(s.joined[sessionId])) || (detail?.invigilators?.length ?? 0) > 0;
  const join = useSessionStore((s) => s.join);
  const scanned = useSessionStore((s) => s.roster[sessionId]);
  const students = [
    ...(detail?.attendance?.map((a) => studentRecordToScanned(a.student)) ?? []),
    ...(scanned ?? []),
  ];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const openScanHub = () => router.push({ pathname: '/verify/index', params: { exam: sessionId } });
  const openMethod = (path: (typeof METHODS)[number]['path']) =>
    router.push({ pathname: path, params: { exam: sessionId } });

  const submitCode = async () => {
    if (!code.trim()) return;
    try {
      await joinMutation.mutateAsync(code.trim());
      join(sessionId);
      setDrawerOpen(false);
      setCode('');
      setError(false);
    } catch {
      setError(true);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <ScreenTopBar
        title="Group Session"
        onBack={() => router.back()}
        trailing={
          <CircleButton
            label={joined ? 'Open scanner' : 'Join the session to scan'}
            onPress={joined ? openScanHub : () => setDrawerOpen(true)}
          >
            <ScanFrameIcon color={joined ? colors.ink : colors.hairline} />
          </CircleButton>
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.members}>
          <View style={styles.member}>
            {joined ? (
              <View style={[styles.addTile, styles.addedTile]}>
                <CheckCircleIcon color={colors.success} size={26} />
              </View>
            ) : (
              <HapticPressable
                accessibilityRole="button"
                accessibilityLabel="Join session"
                onPress={() => setDrawerOpen(true)}
                style={styles.addTile}
              >
                <PlusIcon color={colors.ink} />
              </HapticPressable>
            )}
            <Text style={styles.memberLabel}>{joined ? 'Added' : '+ Join Session'}</Text>
          </View>
          {(detail?.invigilators ?? []).map((m) => {
            const initials =
              m.displayName
                ?.split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'KW';
            return (
              <HapticPressable
                key={m.userId}
                accessibilityRole="button"
                accessibilityLabel="View invigilators"
                onPress={() => router.push('/invigilators')}
                style={styles.member}
              >
                <View style={[styles.addTile, { backgroundColor: colors.primary12 }]}>
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>
                    {initials}
                  </Text>
                </View>
                <Text style={styles.memberLabel}>{initials}</Text>
              </HapticPressable>
            );
          })}
        </View>

        {joined ? (
          <>
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
                      params: { exam: sessionId, student: s.id },
                    })
                  }
                  style={styles.student}
                >
                  <Avatar person="freja" size={44} />
                  <Text numberOfLines={1} style={styles.studentName}>
                    {s.name}
                  </Text>
                </HapticPressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.methods}>
          {METHODS.map((m) => (
            <HapticPressable
              key={m.label}
              accessibilityRole="button"
              accessibilityLabel={`${m.label} verification`}
              onPress={() => (joined ? openMethod(m.path) : setDrawerOpen(true))}
              style={[styles.method, !joined && styles.methodDisabled]}
            >
              <View style={styles.methodCircle}>{m.icon}</View>
              <Text style={styles.methodLabel}>{m.label}</Text>
            </HapticPressable>
          ))}
        </View>

        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Open scan hub"
          onPress={() => (joined ? openScanHub : setDrawerOpen(true))}
          style={styles.heroCard}
        >
          <View style={styles.heroImage}>
            <SceneArt art="arena" />
          </View>
          <View style={styles.heroFooter}>
            <Avatar person="anna" size={44} />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Anna verified Hall A</Text>
              <View style={styles.tracking}>
                <StepsIcon color={colors.inkSoft} size={12} />
                <Text style={styles.trackingText}>Live tracking</Text>
              </View>
            </View>
            <View style={styles.country}>
              <View
                style={[
                  styles.addTile,
                  { width: 18, height: 18, backgroundColor: colors.primary12 },
                ]}
              />
              <Text style={styles.countryText}>Hall A</Text>
            </View>
          </View>
        </HapticPressable>

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
            icon={<SendIcon color={colors.blue} />}
            onPress={() => router.push({ pathname: '/(tabs)/chat', params: { with: 'i1' } })}
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
              <ChevronRightIcon color={colors.primary} size={13} />
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
          onChangeText={(t) => {
            setCode(t);
            setError(false);
          }}
          onSubmitEditing={submitCode}
          placeholder="Session password"
          placeholderTextColor={colors.muted}
          autoFocus
          autoCapitalize="none"
          returnKeyType="go"
          style={[styles.input, error && styles.inputError]}
          testID="join-session-code"
        />
        {error ? <Text style={styles.errorText}>Wrong password — try again.</Text> : null}
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

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  body: { gap: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: spacing.xl },
  members: { flexDirection: 'row', gap: spacing.lg },
  member: { alignItems: 'center', gap: spacing.sm },
  addTile: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  addedTile: { backgroundColor: colors.successSoft },
  memberLabel: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  rosterHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  rosterTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  counter: {
    backgroundColor: colors.primary12,
    borderRadius: radii.pill,
    minWidth: 26,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  counterText: { color: colors.primary, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  roster: { gap: spacing.md },
  student: { alignItems: 'center', gap: 5, width: 56 },
  studentName: { color: colors.inkSoft, fontSize: 11, fontWeight: '600' },
  methods: { flexDirection: 'row', justifyContent: 'space-evenly' },
  method: { alignItems: 'center', gap: spacing.sm },
  methodDisabled: { opacity: 0.4 },
  methodCircle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  methodLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: '600' },
  heroCard: {
    backgroundColor: colors.white,
    borderColor: colors.hairline,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Image runs edge to edge; bottom edge softly curved like the mockup.
  heroImage: {
    borderBottomLeftRadius: radii.md + 4,
    borderBottomRightRadius: radii.md + 4,
    height: 190,
    overflow: 'hidden',
  },
  heroFooter: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  heroText: { flex: 1, gap: 3 },
  heroTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  tracking: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  trackingText: { color: colors.inkSoft, fontSize: 11, fontWeight: '500' },
  country: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  countryText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
  rowCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  thumb: { borderRadius: radii.sm, height: 64, overflow: 'hidden', width: 64 },
  tallThumb: { borderRadius: radii.sm, height: 96, overflow: 'hidden', width: 96 },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  rowSub: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  explore: { alignItems: 'center', flexDirection: 'row', gap: 3, marginTop: 2 },
  exploreText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  drawerHint: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  input: {
    backgroundColor: colors.surfaceDim,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, fontWeight: '600' },
  joinButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg - 2,
  },
  joinButtonText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
