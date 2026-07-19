import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CrownIcon, DocIcon, EllipsisIcon, PinIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { useAuthStore } from '@/store/authStore';
import { colors, radii, spacing } from '@/theme';

const REPORTS = ['CS101_attendance.pdf', 'MA204_flagged.docx', 'PH110_report.pdf'] as const;

/** Soft lavender blobs behind the profile header (reference layout). */
function BannerBlobs() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid slice">
      <Ellipse cx={40} cy={110} rx={90} ry={55} fill={colors.mintDeep} opacity={0.8} />
      <Circle cx={250} cy={20} r={60} fill={colors.mintDeep} opacity={0.55} />
      <Circle cx={160} cy={130} r={45} fill={colors.primary12} />
    </Svg>
  );
}

/** Profile — banner card, overlapping avatar, meta chips, note and report docs. */
export function ProfileScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const name = user?.displayName ?? 'Invigilator';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.banner}>
          <BannerBlobs />
          <View style={styles.bannerBar}>
            <Text style={styles.bannerTitle}>Profile</Text>
            <HapticPressable
              accessibilityRole="button"
              accessibilityLabel="Account upgrade options"
              style={styles.moreButton}
              onPress={() => router.push('/upgrade')}
            >
              <EllipsisIcon color={colors.ink} />
            </HapticPressable>
          </View>
        </View>

        <View style={styles.avatarRing}>
          {user?.pictureUrl ? (
            <Image source={{ uri: user.pictureUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{name}</Text>
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <PinIcon color={colors.primary} />
            <Text style={styles.chipText}>KNUST Campus</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{user?.role ?? 'USER'}</Text>
          </View>
          <View style={[styles.chip, styles.chipPlan]}>
            <Text style={[styles.chipText, styles.chipPlanText]}>{user?.plan ?? 'FREE'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.note}>
            {user?.email ?? 'No email on file.'}
            {'\n'}KEV exam verifier · Version {version}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent reports</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.docs}
          >
            {REPORTS.map((doc) => (
              <HapticPressable
                key={doc}
                accessibilityRole="button"
                accessibilityLabel={`Open ${doc}`}
                onPress={() => router.push('/(tabs)/sessions')}
                style={styles.doc}
              >
                <View style={styles.docBadge}>
                  <DocIcon color={colors.primary} />
                </View>
                <Text numberOfLines={2} style={styles.docName}>
                  {doc}
                </Text>
              </HapticPressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.footerRow}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Premium"
          onPress={() => router.push('/upgrade')}
          style={styles.premium}
        >
          <CrownIcon color={colors.primary} />
          <Text style={styles.premiumText}>Premium</Text>
        </HapticPressable>
        <HapticPressable
          accessibilityRole="button"
          testID="profile-sign-out"
          onPress={() => void signOut()}
          style={styles.signOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </HapticPressable>
      </View>
    </ScrollView>
  );
}

const AVATAR = 92;

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1 },
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl, paddingHorizontal: spacing.xl },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.hairline,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: spacing.lg,
  },
  banner: { borderRadius: radii.lg, height: 120, margin: spacing.sm, overflow: 'hidden' },
  bannerBar: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  bannerTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 36 + spacing.md, // optical centering against the more button
    textAlign: 'center',
  },
  moreButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarRing: {
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderRadius: (AVATAR + 12) / 2,
    marginTop: -(AVATAR / 2) - spacing.sm,
    padding: 6,
  },
  avatar: { borderRadius: AVATAR / 2, height: AVATAR, width: AVATAR },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: colors.primary12,
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.primary, fontSize: 34, fontWeight: '800' },
  name: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  chipText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' },
  chipPlan: { backgroundColor: colors.pinkSoft },
  chipPlanText: { color: colors.pink },
  section: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  note: { color: colors.muted, fontSize: 13, fontWeight: '500', lineHeight: 20 },
  docs: { gap: spacing.md },
  doc: {
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.md,
    gap: spacing.sm,
    padding: spacing.md,
    width: 108,
  },
  docBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary12,
    borderRadius: radii.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  docName: { color: colors.inkSoft, fontSize: 11, fontWeight: '600' },
  footerRow: { flexDirection: 'row', gap: spacing.md },
  premium: {
    alignItems: 'center',
    borderColor: colors.hairline,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  premiumText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  signOut: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    flex: 1,
    paddingVertical: spacing.lg - 2,
  },
  signOutText: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
