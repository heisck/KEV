import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenTopBar } from '@/components/kev/chrome';
import { FaceIdIcon } from '@/components/kev/icons';
import { ScanMethodSwitcher } from '@/components/scan/ScanMethodSwitcher';
import { SessionLockButton } from '@/components/scan/SessionLockButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { useScanCheckIn } from '@/hooks/useScanCheckIn';
import { useScanMethodGuard } from '@/hooks/useScanMethodGuard';
import { useScanNavigation } from '@/hooks/useScanNavigation';
import { useScanSessionId } from '@/hooks/useScanSession';
import { radii, spacing, usePalette } from '@/theme';

function CameraFlipIcon({ color }: { color: string }) {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Circle cx={12} cy={12} fill="none" r={9} stroke={color} strokeWidth={1.7} />
      <Path
        d="M7 10a5.5 5.5 0 0 1 9-2l1.5 1.5M17 14a5.5 5.5 0 0 1-9 2l-1.5-1.5M17.5 6.5v3h-3M6.5 17.5v-3h3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
      />
    </Svg>
  );
}

/** Face verification — the avatar's face is the live camera preview with front/back switch. */
export function FaceScanScreen() {
  const p = usePalette();
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const sessionId = useScanSessionId();
  const { goBack } = useScanNavigation(sessionId);
  const completeScan = useScanCheckIn(sessionId, 'FACE');
  const { allowedMethods, canUse } = useScanMethodGuard(sessionId, 'FACE');
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const previewHeight = Math.min(Math.max(height * 0.46, 320), 520);

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar
        title="Face verification"
        onBack={goBack}
        trailing={<SessionLockButton sessionId={sessionId} />}
      />

      <View style={styles.stage}>
        <View style={[styles.preview, { borderColor: p.primary20, height: previewHeight }]}>
          {permission?.granted ? (
            <CameraView facing={facing} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[styles.facePlaceholder, { backgroundColor: p.surfaceDim }]}>
              <FaceIdIcon color={p.muted} size={44} />
            </View>
          )}
          {permission?.granted ? (
            <HapticPressable
              accessibilityLabel="Switch camera"
              accessibilityRole="button"
              haptic="select"
              onPress={() => setFacing((value) => (value === 'front' ? 'back' : 'front'))}
              style={[styles.switchButton, { backgroundColor: p.surface }]}
            >
              <CameraFlipIcon color={p.ink} />
            </HapticPressable>
          ) : null}
        </View>
        <Text style={[styles.title, { color: p.ink }]}>Align the student&apos;s face</Text>
        <Text style={[styles.sub, { color: p.muted }]}>
          Center the face in the circle, then capture.
        </Text>
      </View>

      <ScanMethodSwitcher active="FACE" sessionId={sessionId} allowedMethods={allowedMethods} />
      {permission?.granted ? (
        <HapticPressable
          accessibilityRole="button"
          disabled={!canUse}
          onPress={() => completeScan()}
          style={[styles.cta, { backgroundColor: p.primary }, !canUse && styles.disabled]}
          testID="face-capture"
        >
          <Text style={[styles.ctaText, { color: p.onPrimary }]}>Capture</Text>
        </HapticPressable>
      ) : (
        <HapticPressable
          accessibilityRole="button"
          disabled={!canUse}
          onPress={() => void requestPermission()}
          style={[styles.cta, { backgroundColor: p.primary }, !canUse && styles.disabled]}
          testID="face-permission"
        >
          <Text style={[styles.ctaText, { color: p.onPrimary }]}>Allow camera</Text>
        </HapticPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  stage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  preview: {
    alignSelf: 'stretch',
    borderRadius: radii.xl,
    borderWidth: 3,
    overflow: 'hidden',
  },
  facePlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', marginTop: spacing.lg },
  sub: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  switchButton: {
    alignItems: 'center',
    bottom: spacing.md,
    borderRadius: radii.pill,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    width: 50,
  },
  cta: {
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingVertical: spacing.lg - 2,
  },
  ctaText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
