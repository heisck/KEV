import { useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionDetail } from '@/api/hooks';
import type { CheckInMethod } from '@/api/schemas';
import { ScreenTopBar } from '@/components/kev/chrome';
import { FaceIdIcon, KeypadIcon, NfcIcon } from '@/components/kev/icons';
import { Avatar, type PersonKey } from '@/components/kev/people';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned } from '@/data/exams';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors, radii, shadows, spacing, usePalette, type Palette } from '@/theme';

const TRACK_WIDTH = 52;
const KNOB = 26;

/** Glassy on/off switch (Apple-toggle feel) built on the design tokens. */
function GlassToggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const p = usePalette();
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? TRACK_WIDTH - KNOB - 3 : 3, { damping: 18 }) }],
  }));
  return (
    <HapticPressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      haptic="select"
      onPress={onToggle}
      style={[styles.track, { backgroundColor: value ? p.primary : p.mintDeep }]}
      testID="success-page-toggle"
    >
      <Animated.View style={[styles.knob, { backgroundColor: p.surface }, knobStyle]} />
    </HapticPressable>
  );
}

const buildMethods = (
  p: Palette,
): { key: CheckInMethod; label: string; path: string; icon: ReactNode }[] => [
  { key: 'FACE', label: 'Face', path: '/verify/face', icon: <FaceIdIcon color={p.pink} /> },
  { key: 'NFC', label: 'NFC', path: '/verify/nfc', icon: <NfcIcon color={p.blue} /> },
  {
    key: 'MANUAL',
    label: 'Manual',
    path: '/verify/manual',
    icon: <KeypadIcon color={p.inkSoft} />,
  },
];

/** Scan hub — roster overview, result-page toggle, and the verification methods. */
export function SessionScanScreen() {
  const router = useRouter();
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const sessionId = exam ?? '1';

  const { data: detail } = useSessionDetail(Number(sessionId) || 1);
  const scanned = useSessionStore((s) => s.roster[sessionId]);
  const showSuccessPage = useSettingsStore((s) => s.showSuccessPage);
  const setShowSuccessPage = useSettingsStore((s) => s.setShowSuccessPage);
  const defaultScanMethod = useSettingsStore((s) => s.defaultScanMethod);
  const students = Array.from(
    new Map(
      [
        ...(detail?.attendance?.map((a) => studentRecordToScanned(a.student)) ?? []),
        ...(scanned ?? []),
      ].map((st) => [st.id, st]),
    ).values(),
  );

  // Only the methods this session enabled (fall back to all when unset).
  const allowed = detail?.session.verificationMethods?.length
    ? detail.session.verificationMethods
    : null;
  const methods = buildMethods(p)
    .filter((m) => !allowed || allowed.includes(m.key))
    // Surface the user's default method first.
    .sort((a, b) => Number(b.key === defaultScanMethod) - Number(a.key === defaultScanMethod));

  const goTo = (path: string) =>
    router.push({ pathname: path as never, params: { exam: sessionId } });

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Scan students" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: p.ink }]}>Lecturers</Text>
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
              <View key={m.userId} style={[styles.addTile, { backgroundColor: p.primary12 }]}>
                <Text style={{ color: p.primary, fontSize: 16, fontWeight: '800' }}>
                  {initials}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.rosterHeader}>
          <Text style={[styles.sectionTitle, { color: p.ink }]}>Students</Text>
          <View style={[styles.counter, { backgroundColor: p.primary12 }]}>
            <Text style={[styles.counterText, { color: p.primary }]}>{students.length}</Text>
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
              <Text numberOfLines={1} style={[styles.studentName, { color: p.inkSoft }]}>
                {s.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.toggleRow, { backgroundColor: p.surfaceDim }]}>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleTitle, { color: p.ink }]}>Show result page after scan</Text>
            <Text style={[styles.toggleSub, { color: p.muted }]}>
              Off = quick toast + vibration, keep scanning
            </Text>
          </View>
          <GlassToggle
            value={showSuccessPage}
            onToggle={() => setShowSuccessPage(!showSuccessPage)}
          />
        </View>

        <View style={styles.methods}>
          {methods.map((m) => (
            <HapticPressable
              key={m.key}
              accessibilityRole="button"
              accessibilityLabel={`${m.label} verification`}
              onPress={() => goTo(m.path)}
              style={styles.method}
            >
              <View style={[styles.methodCircle, { backgroundColor: p.surfaceDim }]}>{m.icon}</View>
              <Text style={[styles.methodLabel, { color: p.inkSoft }]}>{m.label}</Text>
              {m.key === defaultScanMethod ? (
                <Text style={[styles.methodDefault, { color: p.primary }]}>Default</Text>
              ) : null}
            </HapticPressable>
          ))}
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
  methodDefault: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
});
