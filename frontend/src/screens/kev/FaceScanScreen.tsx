import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenTopBar } from '@/components/kev/chrome';
import { FaceIdIcon } from '@/components/kev/icons';
import { FaceCaptureOverlay } from '@/components/scan/FaceCaptureOverlay';
import { ScanMethodSwitcher } from '@/components/scan/ScanMethodSwitcher';
import { SessionLockButton } from '@/components/scan/SessionLockButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import type { FaceIdentifyResponse } from '@/api/schemas';
import { useFaceCapture, type CapturePhase } from '@/hooks/useFaceCapture';
import { useMockScan } from '@/hooks/useMockScan';
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

/** Label and tone for each step of the capture flow. */
const PHASE_COPY: Record<CapturePhase, { title: string; sub: string }> = {
  idle: { title: 'Align the student’s face', sub: 'Center the face in the frame, then capture.' },
  captured: { title: 'Captured', sub: 'You can lower the phone — we work from the photo.' },
  verifying: { title: 'Matching…', sub: 'Checking the shot against the session roster.' },
  matched: { title: 'Verified', sub: 'Marked present. Ready for the next student.' },
  rejected: { title: 'Not verified', sub: 'Check the message below, then capture again.' },
};

const CTA_LABEL: Record<CapturePhase, string> = {
  idle: 'Capture',
  captured: 'Captured',
  verifying: 'Matching…',
  matched: 'Verified',
  rejected: 'Capture again',
};

/** Face verification — the avatar's face is the live camera preview with front/back switch. */
export function FaceScanScreen() {
  const p = usePalette();
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const sessionId = useScanSessionId();
  const { goBack } = useScanNavigation(sessionId);
  const completeScan = useMockScan(sessionId, 'FACE');
  const { allowedMethods, canUse } = useScanMethodGuard(sessionId, 'FACE');
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const previewHeight = Math.min(Math.max(height * 0.46, 320), 520);

  // Identification returns the student, so check-in goes through with a real index
  // number rather than the demo fallback.
  const onMatched = useCallback(
    (result: FaceIdentifyResponse) => {
      if (result.student) void completeScan(result.student.indexNumber);
    },
    [completeScan],
  );
  const { cameraRef, phase, error, busy, photoUri, capture } = useFaceCapture(sessionId, onMatched);
  const copy = PHASE_COPY[phase];

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
            <CameraView ref={cameraRef} facing={facing} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[styles.facePlaceholder, { backgroundColor: p.surfaceDim }]}>
              <FaceIdIcon color={p.muted} size={44} />
            </View>
          )}
          <FaceCaptureOverlay phase={phase} photoUri={photoUri} />
          {permission?.granted && phase === 'idle' ? (
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
        <Text style={[styles.title, { color: p.ink }]}>{copy.title}</Text>
        <Text style={[styles.sub, { color: p.muted }]}>{copy.sub}</Text>
        {error ? (
          <Text style={[styles.error, { color: p.error }]} testID="face-error">
            {error}
          </Text>
        ) : null}
      </View>

      <ScanMethodSwitcher active="FACE" sessionId={sessionId} allowedMethods={allowedMethods} />
      {permission?.granted ? (
        <HapticPressable
          accessibilityRole="button"
          accessibilityState={{ busy, disabled: !canUse || busy }}
          disabled={!canUse || busy}
          onPress={() => void capture()}
          style={[styles.cta, { backgroundColor: p.primary }, (!canUse || busy) && styles.disabled]}
          testID="face-capture"
        >
          <View style={styles.ctaInner}>
            {busy ? <ActivityIndicator color={p.onPrimary} size="small" /> : null}
            <Text style={[styles.ctaText, { color: p.onPrimary }]}>{CTA_LABEL[phase]}</Text>
          </View>
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
  error: { fontSize: 13, fontWeight: '600', marginTop: spacing.sm, textAlign: 'center' },
  ctaInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
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
