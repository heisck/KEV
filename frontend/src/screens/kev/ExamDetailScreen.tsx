import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionDetail, useSessions } from '@/api/hooks';
import type { SessionDto } from '@/api/schemas';
import { CircleButton, ScreenTopBar } from '@/components/kev/chrome';
import {
  CheckCircleIcon,
  FaceIdIcon,
  KeypadIcon,
  NfcIcon,
  PencilIcon,
  PlusIcon,
  RemindersTabIcon,
  ScanFrameIcon,
  StudentsIcon,
} from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { SessionArtwork } from '@/components/session/SessionArtwork';
import { SessionAccessCard } from '@/components/session/SessionAccessCard';
import { SessionJoinDrawer } from '@/components/session/SessionJoinDrawer';
import { isPastSession, scanBlockMessage } from '@/lib/sessionLifecycle';
import { allowedScanMethods } from '@/lib/scanMethods';
import { toast } from '@/lib/toast';
import { spacing, usePalette } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { examDetailStyles as styles } from '@/screens/kev/examDetailStyles';

/** Session details (kev mockup screen 2). */
export function ExamDetailScreen() {
  const p = usePalette();
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const examId = id ?? '1';
  const numericExamId = Number(examId) || 1;
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinedLocally, setJoinedLocally] = useState(false);
  const preferredMethod = useSettingsStore((state) => state.defaultScanMethod);
  const useAllScanMethods = useSettingsStore((state) => state.useAllScanMethods);
  const userRole = useAuthStore((s) => s.user?.role);
  const isNonScanner = userRole === 'ADMIN' || userRole === 'LECTURER';

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

  const user = useAuthStore((state) => state.user);
  const { data: allSessions, isLoading: sessionsLoading } = useSessions();
  const listedSession = allSessions?.find((s: SessionDto) => String(s.id) === examId);
  const isPast = isPastSession(listedSession?.status);
  const isUserAdmin = user?.role === 'ADMIN';
  const canViewDetailDirectly =
    joinedLocally || listedSession?.joined === true || isPast || isUserAdmin;
  const { data: detail, isLoading: detailLoading } = useSessionDetail(
    numericExamId,
    canViewDetailDirectly,
  );
  const session = detail?.session ?? listedSession;
  const joined = canViewDetailDirectly;

  // Only the methods this session enabled (fall back to all when unset).
  const allowed = allowedScanMethods(
    session?.verificationMethods,
    useAllScanMethods,
    preferredMethod,
  );
  const methods = METHODS.filter((method) => allowed.includes(method.key));

  const isUpcoming = session?.status === 'UPCOMING';
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
    if (isPast) return toast.info('This session is closed.');
    if (!joined && !isUserAdmin) return setJoinOpen(true);
    if (scanMessage) return toast.info(scanMessage);
    router.push({ pathname: '/group-session', params: { exam: examId } });
  };

  const openMethod = (path: (typeof METHODS)[number]['path']) => {
    if (isPast) return toast.info('This session is closed.');
    if (!joined && !isUserAdmin) return setJoinOpen(true);
    if (scanMessage) return toast.info(scanMessage);
    router.push({ pathname: path, params: { exam: examId } });
  };

  if (!session && (sessionsLoading || detailLoading)) {
    return (
      <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
        <ScreenTopBar title="Session details" onBack={() => router.replace('/(tabs)')} />
        <LoadingSkeleton style={styles.loading} testID="session-detail-skeleton" variant="detail" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar
        title="Session details"
        onBack={() => router.replace('/(tabs)')}
        trailing={
          isUserAdmin ? (
            <View style={[styles.closedPill, { backgroundColor: p.surfaceDim }]}>
              <Text style={[styles.closedText, { color: p.muted }]}>View Only</Text>
            </View>
          ) : isPast ? (
            <View style={[styles.closedPill, { backgroundColor: p.surfaceDim }]}>
              <Text style={[styles.closedText, { color: p.muted }]}>Closed</Text>
            </View>
          ) : (
            <View style={styles.headerActions}>
              {session && joined ? (
                <CircleButton
                  label="Edit session"
                  onPress={() =>
                    router.push({ pathname: '/room-setup', params: { sessionId: examId } })
                  }
                >
                  <PencilIcon color={p.ink} size={18} />
                </CircleButton>
              ) : null}
              <CircleButton
                label={joined ? (scanMessage ?? 'Scan') : 'Join session'}
                onPress={openScanHub}
              >
                {joined ? (
                  <ScanFrameIcon color={scanMessage ? p.muted : p.ink} />
                ) : (
                  <PlusIcon color={p.ink} />
                )}
              </CircleButton>
            </View>
          )
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: p.surfaceDim }]}>
          <View style={styles.hero}>
            <SessionArtwork seed={examId} variant="feature" />
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

        {session && joined ? (
          <View style={styles.accessCard}>
            <SessionAccessCard
              code={session.sessionCode}
              password={session.sessionPassword ?? session.sessionCode}
            />
          </View>
        ) : null}

        <Text style={[styles.section, { color: p.ink }]}>Verification methods</Text>
        <View style={[styles.amenities, (isPast || isNonScanner) && { opacity: 0.45 }]}>
          {methods.map((m) => (
            <HapticPressable
              key={m.label}
              accessibilityRole="button"
              accessibilityLabel={`${m.label} verification`}
              accessibilityState={{ disabled: isPast || isNonScanner }}
              disabled={isPast || isNonScanner}
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
      {!isPast ? (
        <SessionJoinDrawer
          sessionId={numericExamId}
          visible={joinOpen}
          onClose={() => setJoinOpen(false)}
          onJoined={() => setJoinedLocally(true)}
        />
      ) : null}
    </View>
  );
}
