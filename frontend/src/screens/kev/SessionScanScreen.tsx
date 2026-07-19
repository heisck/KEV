import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionDetail } from '@/api/hooks';
import { ScreenTopBar } from '@/components/kev/chrome';
import { FaceIdIcon, KeypadIcon, NfcIcon } from '@/components/kev/icons';
import { Avatar, type PersonKey } from '@/components/kev/people';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned } from '@/data/exams';
import { useSessionStore } from '@/store/sessionStore';
import { colors, radii, shadows, spacing } from '@/theme';

const TRACK_WIDTH = 52;
const KNOB = 26;

/** Glassy on/off switch (Apple-toggle feel) built on the design tokens. */
function GlassToggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? TRACK_WIDTH - KNOB - 3 : 3, { damping: 18 }) }],
  }));
  return (
    <HapticPressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      haptic="select"
      onPress={onToggle}
      style={[styles.track, value && styles.trackOn]}
      testID="auto-add-toggle"
    >
      <Animated.View style={[styles.knob, knobStyle]} />
    </HapticPressable>
  );
}

/** Scan hub — roster overview, auto-add toggle, and the three verification methods. */
export function SessionScanScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const sessionId = exam ?? '1';

  const { data: detail } = useSessionDetail(Number(sessionId) || 1);
  const scanned = useSessionStore((s) => s.roster[sessionId]);
  const autoAdd = useSessionStore((s) => s.autoAdd);
  const setAutoAdd = useSessionStore((s) => s.setAutoAdd);
  const students = [
    ...(detail?.attendance?.map((a) => studentRecordToScanned(a.student)) ?? []),
    ...(scanned ?? []),
  ];

  const goTo = (method: '/verify/nfc' | '/verify/face' | '/verify/manual') =>
    router.push({ pathname: method, params: { exam: sessionId } });

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Scan students" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Lecturers</Text>
        <View style={styles.lecturers}>
          {(detail?.invigilators ?? []).map((m) => {
            const initials =
              m.displayName
                ?.split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'KW';
            return (
              <View key={m.userId} style={[styles.addTile, { backgroundColor: colors.primary12 }]}>
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>
                  {initials}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.rosterHeader}>
          <Text style={styles.sectionTitle}>Students</Text>
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
            <View key={s.id} style={styles.student}>
              <Avatar person={s.person as PersonKey} size={44} />
              <Text numberOfLines={1} style={styles.studentName}>
                {s.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleTitle}>Auto-add scanned students</Text>
            <Text style={styles.toggleSub}>Off = review each student before adding</Text>
          </View>
          <GlassToggle value={autoAdd} onToggle={() => setAutoAdd(!autoAdd)} />
        </View>

        <View style={styles.methods}>
          <HapticPressable
            accessibilityRole="button"
            onPress={() => goTo('/verify/face')}
            style={styles.method}
          >
            <View style={styles.methodCircle}>
              <FaceIdIcon color={colors.pink} />
            </View>
            <Text style={styles.methodLabel}>Face</Text>
          </HapticPressable>
          <HapticPressable
            accessibilityRole="button"
            onPress={() => goTo('/verify/nfc')}
            style={styles.method}
          >
            <View style={styles.methodCircle}>
              <NfcIcon color={colors.blue} />
            </View>
            <Text style={styles.methodLabel}>NFC</Text>
          </HapticPressable>
          <HapticPressable
            accessibilityRole="button"
            onPress={() => goTo('/verify/manual')}
            style={styles.method}
          >
            <View style={styles.methodCircle}>
              <KeypadIcon color={colors.inkSoft} />
            </View>
            <Text style={styles.methodLabel}>Manual</Text>
          </HapticPressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  body: { gap: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: spacing.xl },
  addTile: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  lecturers: { flexDirection: 'row', gap: spacing.lg },
  rosterHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
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
  toggleRow: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  toggleText: { flex: 1, gap: 2 },
  toggleTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  toggleSub: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  track: {
    backgroundColor: colors.mintDeep,
    borderRadius: radii.pill,
    height: KNOB + 6,
    justifyContent: 'center',
    width: TRACK_WIDTH,
  },
  trackOn: { backgroundColor: colors.primary },
  knob: {
    backgroundColor: colors.white,
    borderRadius: KNOB / 2,
    height: KNOB,
    width: KNOB,
    ...shadows.card,
  },
  methods: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: spacing.sm },
  method: { alignItems: 'center', gap: spacing.sm },
  methodCircle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  methodLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: '600' },
});
