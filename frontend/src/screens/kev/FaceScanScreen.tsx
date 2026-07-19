import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenTopBar } from '@/components/kev/chrome';
import { FaceIdIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { useMockScan } from '@/hooks/useMockScan';
import { colors, radii, spacing } from '@/theme';

const FACE = 168;

/** Face verification — the avatar's face is the live camera preview. */
export function FaceScanScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { exam } = useLocalSearchParams<{ exam?: string }>();
  const completeScan = useMockScan(exam ?? 'ma204');
  const [permission, requestPermission] = useCameraPermissions();

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Face verification" onBack={() => router.back()} />

      <View style={styles.stage}>
        <View style={styles.face}>
          {permission?.granted ? (
            <CameraView facing="front" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.facePlaceholder}>
              <FaceIdIcon color={colors.muted} size={44} />
            </View>
          )}
        </View>
        {/* Shoulders under the camera face — the avatar "body". */}
        <Svg width={280} height={120} viewBox="0 0 280 120" style={styles.body}>
          <Path d="M20 120c10-52 56-78 120-78s110 26 120 78H20Z" fill={colors.mintDeep} />
          <Path d="M108 46h64v28c0 18-14 30-32 30s-32-12-32-30V46Z" fill={colors.mint} />
        </Svg>

        <Text style={styles.title}>Align the student&apos;s face</Text>
        <Text style={styles.sub}>Center the face in the circle, then capture.</Text>
      </View>

      {permission?.granted ? (
        <HapticPressable
          accessibilityRole="button"
          onPress={() => completeScan()}
          style={styles.cta}
          testID="face-capture"
        >
          <Text style={styles.ctaText}>Capture</Text>
        </HapticPressable>
      ) : (
        <HapticPressable
          accessibilityRole="button"
          onPress={() => void requestPermission()}
          style={styles.cta}
          testID="face-permission"
        >
          <Text style={styles.ctaText}>Allow camera</Text>
        </HapticPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.white,
    flex: 1,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  stage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  face: {
    borderColor: colors.primary20,
    borderRadius: FACE / 2,
    borderWidth: 4,
    height: FACE,
    overflow: 'hidden',
    width: FACE,
    zIndex: 1,
  },
  facePlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    flex: 1,
    justifyContent: 'center',
  },
  body: { marginTop: -34 },
  title: { color: colors.ink, fontSize: 18, fontWeight: '800', marginTop: spacing.xl },
  sub: { color: colors.muted, fontSize: 13, fontWeight: '500', marginTop: 4 },
  cta: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg - 2,
  },
  ctaText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
