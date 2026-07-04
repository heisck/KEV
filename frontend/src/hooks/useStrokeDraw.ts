import { useEffect } from 'react';
import {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/**
 * Stroke draw-in animation for SVG paths: returns animatedProps that sweep
 * strokeDashoffset from `length` to 0. Pair with strokeDasharray={length}.
 */
export function useStrokeDraw(length: number, delayMs = 0, durationMs = 900) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delayMs,
      withTiming(1, { duration: durationMs, easing: Easing.out(Easing.cubic) }),
    );
  }, [delayMs, durationMs, progress]);

  return useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
  }));
}
