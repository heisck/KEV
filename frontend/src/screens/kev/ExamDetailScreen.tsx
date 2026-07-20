import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionDetail, useSessions } from '@/api/hooks';
import { SceneArt } from '@/components/kev/art';
import { BlueChip, CircleButton, ScreenTopBar } from '@/components/kev/chrome';
import {
  CheckCircleIcon,
  FaceIdIcon,
  KeypadIcon,
  NfcIcon,
  PencilIcon,
  RemindersTabIcon,
  ScanFrameIcon,
  StepsIcon,
  StudentsIcon,
} from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { SessionAccessCard } from '@/components/session/SessionAccessCard';
import { isPastSession, scanBlockMessage } from '@/lib/sessionLifecycle';
import { toast } from '@/lib/toast';
import { colors, radii, spacing, usePalette } from '@/theme';

/** Session details (kev mockup screen 2). */
export function ExamDetailScreen() {
  const p = usePalette();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const examId = id ?? '1';

  const METHODS = [
    {
      key: 'FACE',
      label: 'Face',
      icon: <FaceIdIcon color={p.pink} />,
      path: '/verify/face' as const,
    },
    { key: 'NFC', label: 'NFC', icon: <NfcIcon color={p.blue} />, path: '/verify/nfc' as const },
    {
      key: 'MANUAL',
      label: 'Manual',
      icon: <KeypadIcon color={p.inkSoft} />,
      path: '/verify/manual' as const,
    },
  ] as const;

  const { data: detail } = useSessionDetail(Number(examId) || 1);
  const { data: allSessions } = useSessions();
  const session = detail?.session ?? allSessions?.find((s) => String(s.id) === examId);

  // Only the methods this session enabled (fall back to all when unset).
  const allowed = session?.verificationMethods?.length ? session.verificationMethods : null;
  const methods = METHODS.filter((m) => !allowed || allowed.includes(m.key));

  const isUpcoming = session?.status === 'UPCOMING';
  const isPast = isPastSession(session?.status);
  const scanMessage = session
    ? scanBlockMessage(session.status)
    : 'Session details are still loading';
  const hall = session?.title ?? session?.building ?? 'Main Exam Hall';
  const verified = detail?.attendance?.length ?? Number(session?.checkedInCount ?? 0);
  const studentsCount = isUpcoming ? 'Unknown' : verified + 10;
  const score = isUpcoming
    ? 'N/A'
    : studentsCount === 'Unknown' || studentsCount === 0
      ? '0%'
      : `${Math.min(100, Math.round((verified / Number(studentsCount)) * 100))}%`;
  const starts = session?.startTime ?? '09:00';
  const ends = session?.endTime ?? '12:00';
  const dateStr =
    session?.examDate ?? new Date(session?.startedAt ?? Date.now()).toLocaleDateString();

  const openScanHub = () => {
    if (scanMessage) return toast.info(scanMessage);
    router.push({ pathname: '/group-session', params: { exam: examId } });
  };

  const openMethod = (path: (typeof METHODS)[number]['path']) => {
    if (scanMessage) return toast.info(scanMessage);
    router.push({ pathname: path, params: { exam: examId } });
  };

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar
        title="Session details"
        onBack={() => router.replace('/(tabs)')}
        trailing={
          <View style={styles.headerActions}>
            {session && !isPast ? (
              <CircleButton
                label="Edit session"
                onPress={() =>
                  router.push({ pathname: '/room-setup', params: { sessionId: examId } })
                }
              >
                <PencilIcon color={p.ink} size={18} />
              </CircleButton>
            ) : null}
            <CircleButton label={scanMessage ?? 'Scan'} onPress={openScanHub}>
              <ScanFrameIcon color={scanMessage ? p.muted : p.ink} />
            </CircleButton>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: p.surfaceDim }]}>
          <View style={styles.hero}>
            <SceneArt art="hall" />
          </View>
          {!isUpcoming ? (
            <View style={[styles.ratingBadge, { backgroundColor: p.surface }]}>
              <Text style={[styles.ratingBadgeText, { color: p.ink }]}>{score}</Text>
            </View>
          ) : null}

          <View style={styles.cardBody}>
            <Text style={[styles.hotel, { color: p.ink }]}>{hall}</Text>
            <View style={styles.ratingRow}>
              {!isUpcoming ? (
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <CheckCircleIcon key={i} color={p.success} size={15} />
                  ))}
                  <Text style={[styles.ratingText, { color: p.inkSoft }]}>{verified} verified</Text>
                </View>
              ) : (
                <Text style={[styles.ratingText, { color: p.inkSoft }]}>Upcoming Exam</Text>
              )}
              <BlueChip
                label="Open room map"
                icon={<StepsIcon color={p.blue} />}
                onPress={() => router.push('/room-setup')}
              />
            </View>

            <View style={styles.datesRow}>
              <View style={[styles.dateBox, { backgroundColor: p.surface }]}>
                <Text style={[styles.dateLabel, { color: p.muted }]}>Starts</Text>
                <Text style={[styles.dateValue, { color: p.ink }]}>{starts}</Text>
              </View>
              <View style={[styles.dateBox, { backgroundColor: p.surface }]}>
                <Text style={[styles.dateLabel, { color: p.muted }]}>Ends</Text>
                <Text style={[styles.dateValue, { color: p.ink }]}>{ends}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: p.hairline }]} />
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <RemindersTabIcon color={p.ink} size={18} />
                <Text style={[styles.metaText, { color: p.ink }]}>{String(dateStr)}</Text>
              </View>
              <View style={styles.metaItem}>
                <StudentsIcon color={p.ink} />
                <Text style={[styles.metaText, { color: p.ink }]}>{studentsCount} students</Text>
              </View>
            </View>
          </View>
        </View>

        {session ? (
          <View style={styles.accessCard}>
            <SessionAccessCard
              code={session.sessionCode}
              password={session.sessionPassword ?? session.sessionCode}
            />
          </View>
        ) : null}

        <Text style={[styles.section, { color: p.ink }]}>Verification methods</Text>
        <View style={[styles.amenities, scanMessage && { opacity: 0.5 }]}>
          {methods.map((m) => (
            <HapticPressable
              key={m.label}
              accessibilityRole="button"
              accessibilityLabel={`${m.label} verification`}
              onPress={() => openMethod(m.path)}
              style={styles.amenity}
            >
              <View style={[styles.amenityCircle, { backgroundColor: p.surfaceDim }]}>
                {m.icon}
              </View>
              <Text style={[styles.amenityLabel, { color: p.inkSoft }]}>{m.label}</Text>
            </HapticPressable>
          ))}
        </View>

        {!isUpcoming ? (
          <>
            <View style={styles.priceRow}>
              <Text style={[styles.section, { color: p.ink }]}>Attendance</Text>
              <Text style={[styles.price, { color: p.ink }]}>
                {verified}/{studentsCount}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.taxLabel, { color: p.muted }]}>Flagged</Text>
              <Text style={[styles.tax, { color: p.ink }]}>0</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  body: { paddingBottom: spacing.xxxl, paddingTop: spacing.lg },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  card: {
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardBody: { padding: spacing.lg },
  accessCard: { marginTop: spacing.lg },
  // Image runs edge to edge of the card; bottom edge softly curved (mockup).
  hero: {
    borderBottomLeftRadius: radii.md + 4,
    borderBottomRightRadius: radii.md + 4,
    height: 200,
    overflow: 'hidden',
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    height: 58,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    top: 200 - 29,
    width: 58,
  },
  ratingBadgeText: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  hotel: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  stars: { alignItems: 'center', flexDirection: 'row', gap: 3 },
  ratingText: { color: colors.inkSoft, fontSize: 13, fontWeight: '600', marginLeft: 5 },
  datesRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  dateBox: {
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    flex: 1,
    gap: 3,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg - 2,
  },
  dateLabel: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  dateValue: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  // Full-bleed across the card, past its padding (mockup).
  divider: {
    backgroundColor: colors.hairline,
    height: 1,
    marginHorizontal: -spacing.lg,
    marginVertical: spacing.lg,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  metaItem: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  metaText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  section: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: spacing.xl },
  amenities: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  amenity: { alignItems: 'center', gap: spacing.sm },
  amenityCircle: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    height: 62,
    justifyContent: 'center',
    width: 62,
  },
  amenityLabel: { color: colors.inkSoft, fontSize: 11, fontWeight: '600' },
  priceRow: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between' },
  price: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  taxLabel: { color: colors.muted, fontSize: 14, fontWeight: '500', marginTop: spacing.md },
  tax: { color: colors.ink, fontSize: 15, fontWeight: '700' },
});
