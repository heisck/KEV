import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type FloatLoopProps = {
  children: React.ReactNode;
  /** Vertical travel in px. */
  amplitude?: number;
  durationMs?: number;
  style?: StyleProp<ViewStyle>;
};

/** Slow infinite bob used by every doodle illustration. */
export function FloatLoop({ children, amplitude = 5, durationMs = 2600, style }: FloatLoopProps) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: durationMs / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(amplitude, { duration: durationMs / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [amplitude, durationMs, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
