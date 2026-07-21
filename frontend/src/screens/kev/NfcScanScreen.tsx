import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenTopBar } from '@/components/kev/chrome';
import { NfcIcon } from '@/components/kev/icons';
import { ScanMethodSwitcher } from '@/components/scan/ScanMethodSwitcher';
import { SessionLockButton } from '@/components/scan/SessionLockButton';
import { useMockScan } from '@/hooks/useMockScan';
import { useScanMethodGuard } from '@/hooks/useScanMethodGuard';
import { useScanNavigation } from '@/hooks/useScanNavigation';
import { useScanSessionId } from '@/hooks/useScanSession';
import { radii, shadows, spacing, usePalette } from '@/theme';

const SCAN_DELAY_MS = 3000;

/** NFC scan — card floats to the phone and back until a tag is detected. */
export function NfcScanScreen() {
  const p = usePalette();
  const { bottom, top } = useSafeAreaInsets();
  const sessionId = useScanSessionId();
  const { goBack } = useScanNavigation(sessionId);
  const completeScan = useMockScan(sessionId, 'NFC');
  const { allowedMethods, canUse } = useScanMethodGuard(sessionId, 'NFC');

  const drift = useSharedValue(0);

  useEffect(() => {
    if (!canUse) return undefined;
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    // Simulated tag detection until react-native-nfc-manager is wired here.
    const timer = setTimeout(completeScan, SCAN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [canUse, completeScan, drift]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * -84 }, { rotate: `${-8 + drift.value * 8}deg` }],
  }));
  const wavesStyle = useAnimatedStyle(() => ({ opacity: 0.25 + drift.value * 0.75 }));

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: p.bg, paddingBottom: bottom + spacing.lg, paddingTop: top + spacing.md },
      ]}
    >
      <ScreenTopBar
        title="NFC scan"
        onBack={goBack}
        trailing={<SessionLockButton sessionId={sessionId} />}
      />

      <View style={styles.stage}>
        <View style={[styles.phone, { backgroundColor: p.surfaceDim, borderColor: p.hairline }]}>
          <View style={[styles.phoneNotch, { backgroundColor: p.hairline }]} />
          <Animated.View style={wavesStyle}>
            <NfcIcon color={p.primary} size={34} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.card, { backgroundColor: p.primary }, cardStyle]}>
          <View style={[styles.cardChip, { backgroundColor: p.warn }]} />
          <NfcIcon color={p.onPrimary} size={20} />
          <Text style={[styles.cardText, { color: p.onPrimary }]}>Student ID</Text>
        </Animated.View>
      </View>

      <View style={styles.copy}>
        <Text style={[styles.title, { color: p.ink }]}>Hold the card near the phone</Text>
        <Text style={[styles.sub, { color: p.muted }]}>
          Keep the student ID steady until it reads.
        </Text>
      </View>
      <ScanMethodSwitcher active="NFC" sessionId={sessionId} allowedMethods={allowedMethods} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  stage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  phone: {
    alignItems: 'center',
    borderRadius: radii.xl,
    borderWidth: 2,
    height: 224,
    justifyContent: 'center',
    width: 124,
  },
  phoneNotch: {
    borderRadius: radii.pill,
    height: 5,
    position: 'absolute',
    top: 10,
    width: 40,
  },
  card: {
    alignItems: 'flex-start',
    borderRadius: radii.md,
    gap: 6,
    height: 74,
    justifyContent: 'flex-end',
    marginTop: spacing.xxl,
    padding: spacing.md,
    width: 118,
    ...shadows.floating,
  },
  cardChip: {
    borderRadius: 3,
    height: 12,
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 16,
  },
  cardText: { fontSize: 11, fontWeight: '700' },
  copy: { alignItems: 'center', gap: 4, paddingBottom: spacing.xl },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 13, fontWeight: '500' },
});
