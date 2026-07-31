import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CheckCircleIcon, CloseIcon } from '@/components/kev/icons';
import type { CapturePhase } from '@/hooks/useFaceCapture';
import { durations, radii, springs, usePalette } from '@/theme';

/** One pass of the matching sweep across the frozen shot. */
const SWEEP_MS = 1100;
const SWEEP_HEIGHT = 3;
const BADGE = 76;

type FaceCaptureOverlayProps = {
  phase: CapturePhase;
  /** Frozen frame under review — null until the shutter returns a file. */
  photoUri: string | null;
};

/**
 * Sits over the live camera and takes it over the moment a shot lands: shutter flash,
 * the still settling into place, a matching sweep, then the verdict. The frozen frame is
 * the point — it is the signal that the phone can come away from the student's face.
 */
export function FaceCaptureOverlay({ phase, photoUri }: FaceCaptureOverlayProps) {
  const p = usePalette();
  const [height, setHeight] = useState(0);
  const flash = useSharedValue(0);
  const settle = useSharedValue(0);
  const sweep = useSharedValue(0);
  const verdict = useSharedValue(0);

  const matched = phase === 'matched';
  const resolved = matched || phase === 'rejected';
  const frozen = phase !== 'idle' && photoUri !== null;
  const tone = matched ? p.success : p.error;

  useEffect(() => {
    if (phase !== 'captured' || photoUri) return;
    flash.value = withSequence(withTiming(1, { duration: 60 }), withTiming(0, { duration: 220 }));
  }, [flash, phase, photoUri]);

  useEffect(() => {
    settle.value = frozen ? withSpring(1, springs.sheet) : withTiming(0, { duration: 120 });
  }, [frozen, settle]);

  useEffect(() => {
    if (phase !== 'verifying') {
      sweep.value = 0;
      return;
    }
    sweep.value = withRepeat(
      withTiming(1, { duration: SWEEP_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [phase, sweep]);

  useEffect(() => {
    verdict.value = resolved
      ? withSpring(1, springs.press)
      : withTiming(0, { duration: durations.fast });
  }, [resolved, verdict]);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const frameStyle = useAnimatedStyle(() => ({
    opacity: settle.value,
    transform: [{ scale: 0.94 + settle.value * 0.06 }],
  }));
  const sweepStyle = useAnimatedStyle(() => ({
    opacity: sweep.value === 0 ? 0 : 0.4 + sweep.value * 0.5,
    transform: [{ translateY: sweep.value * Math.max(height - SWEEP_HEIGHT, 0) }],
  }));
  const verdictStyle = useAnimatedStyle(() => ({
    opacity: verdict.value,
    transform: [{ scale: 0.7 + verdict.value * 0.3 }],
  }));

  return (
    <View
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {photoUri ? (
        <Animated.View style={[StyleSheet.absoluteFill, frameStyle]} testID="face-freeze-frame">
          <Image contentFit="cover" source={{ uri: photoUri }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}

      {phase === 'verifying' ? (
        <>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: p.primary12 }]} />
          <Animated.View
            style={[styles.sweep, { backgroundColor: p.primary }, sweepStyle]}
            testID="face-scan-sweep"
          />
        </>
      ) : null}

      {resolved ? (
        <View style={styles.center}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: tone, opacity: 0.14 }]} />
          <Animated.View
            style={[styles.badge, { backgroundColor: p.surface }, verdictStyle]}
            testID="face-verdict"
          >
            {matched ? (
              <CheckCircleIcon color={tone} size={40} />
            ) : (
              <CloseIcon color={tone} size={34} />
            )}
          </Animated.View>
        </View>
      ) : null}

      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: p.surface }, flashStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  sweep: { height: SWEEP_HEIGHT, left: 0, position: 'absolute', right: 0, top: 0 },
  badge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: BADGE,
    justifyContent: 'center',
    width: BADGE,
  },
});
