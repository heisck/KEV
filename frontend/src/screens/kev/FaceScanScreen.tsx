import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenTopBar } from '@/components/kev/chrome';
import { FaceIdIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { useMockScan } from '@/hooks/useMockScan';
import { radii, spacing, usePalette } from '@/theme';

const FACE = 168;

/** Face verification — the avatar's face is the live camera preview with front/back switch. */
export function FaceScanScreen() {
  const router = useRouter();
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const completeScan = useMockScan(exam ?? '1', 'FACE');
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Face verification" onBack={() => router.back()} />

      <View style={styles.stage}>
        <View style={[styles.face, { borderColor: p.primary20 }]}>
          {permission?.granted ? (
            <CameraView facing={facing} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[styles.facePlaceholder, { backgroundColor: p.surfaceDim }]}>
              <FaceIdIcon color={p.muted} size={44} />
            </View>
          )}
        </View>
        {/* Shoulders under the camera face — the avatar "body". */}
        <Svg width={280} height={120} viewBox="0 0 280 120" style={styles.body}>
          <Path d="M20 120c10-52 56-78 120-78s110 26 120 78H20Z" fill={p.mintDeep} />
          <Path d="M108 46h64v28c0 18-14 30-32 30s-32-12-32-30V46Z" fill={p.mint} />
        </Svg>

        <Text style={[styles.title, { color: p.ink }]}>Align the student&apos;s face</Text>
        <Text style={[styles.sub, { color: p.muted }]}>
          Center the face in the circle, then capture.
        </Text>
        {permission?.granted ? (
          <HapticPressable
            accessibilityRole="button"
            onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
            style={[styles.switchBtn, { backgroundColor: p.surfaceDim }]}
          >
            <Text style={[styles.switchBtnText, { color: p.ink }]}>Switch Camera ({facing})</Text>
          </HapticPressable>
        ) : null}
      </View>

      {permission?.granted ? (
        <HapticPressable
          accessibilityRole="button"
          onPress={() => completeScan()}
          style={[styles.cta, { backgroundColor: p.primary }]}
          testID="face-capture"
        >
          <Text style={[styles.ctaText, { color: p.onPrimary }]}>Capture</Text>
        </HapticPressable>
      ) : (
        <HapticPressable
          accessibilityRole="button"
          onPress={() => void requestPermission()}
          style={[styles.cta, { backgroundColor: p.primary }]}
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
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  stage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  face: {
    borderRadius: FACE / 2,
    borderWidth: 4,
    height: FACE,
    overflow: 'hidden',
    width: FACE,
    zIndex: 1,
  },
  facePlaceholder: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  body: { marginTop: -34 },
  title: { fontSize: 18, fontWeight: '800', marginTop: spacing.xl },
  sub: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  switchBtn: {
    borderRadius: radii.pill,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switchBtnText: { fontSize: 13, fontWeight: '700' },
  cta: {
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingVertical: spacing.lg - 2,
  },
  ctaText: { fontSize: 15, fontWeight: '700' },
});
