import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SceneArt } from '@/components/kev/art';
import { BlueChip, CircleButton, ScreenTopBar } from '@/components/kev/chrome';
import {
  CheckCircleIcon,
  FaceIdIcon,
  KeypadIcon,
  NfcIcon,
  RemindersTabIcon,
  ScanFrameIcon,
  StepsIcon,
  StudentsIcon,
} from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { SESSION } from '@/data/exams';
import { colors, radii, spacing } from '@/theme';

const METHODS = [
  { label: 'Face', icon: <FaceIdIcon color={colors.pink} />, path: '/verify/face' as const },
  { label: 'NFC', icon: <NfcIcon color={colors.blue} />, path: '/verify/nfc' as const },
  { label: 'Manual', icon: <KeypadIcon color={colors.inkSoft} />, path: '/verify/manual' as const },
] as const;

/** Session details (kev mockup screen 2). */
export function ExamDetailScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const examId = id ?? 'cs101';

  const openScanHub = () => router.push({ pathname: '/verify/index', params: { exam: examId } });

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <ScreenTopBar
        title="Session details"
        onBack={() => router.back()}
        trailing={
          <CircleButton label="Scan" onPress={openScanHub}>
            <ScanFrameIcon color={colors.ink} />
          </CircleButton>
        }
      />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.hero}>
            <SceneArt art="hall" />
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>{SESSION.score}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.hotel}>{SESSION.hall}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <CheckCircleIcon key={i} color={colors.success} size={15} />
                ))}
                <Text style={styles.ratingText}>{SESSION.verified} verified</Text>
              </View>
              <BlueChip
                label="Open room map"
                icon={<StepsIcon color={colors.blue} />}
                onPress={() => router.push('/room-setup')}
              />
            </View>

            <View style={styles.datesRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Starts</Text>
                <Text style={styles.dateValue}>{SESSION.starts}</Text>
              </View>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Ends</Text>
                <Text style={styles.dateValue}>{SESSION.ends}</Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <RemindersTabIcon color={colors.ink} size={18} />
                <Text style={styles.metaText}>{SESSION.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <StudentsIcon color={colors.ink} />
                <Text style={styles.metaText}>{SESSION.students} students</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.section}>Verification methods</Text>
        <View style={styles.amenities}>
          {METHODS.map((m) => (
            <HapticPressable
              key={m.label}
              accessibilityRole="button"
              accessibilityLabel={`${m.label} verification`}
              onPress={() => router.push({ pathname: m.path, params: { exam: examId } })}
              style={styles.amenity}
            >
              <View style={styles.amenityCircle}>{m.icon}</View>
              <Text style={styles.amenityLabel}>{m.label}</Text>
            </HapticPressable>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.section}>Attendance</Text>
          <Text style={styles.price}>
            {SESSION.verified}/{SESSION.students}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.taxLabel}>Flagged</Text>
          <Text style={styles.tax}>{SESSION.flagged}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  body: { paddingBottom: spacing.xxxl, paddingTop: spacing.lg },
  card: {
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardBody: { padding: spacing.lg },
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
