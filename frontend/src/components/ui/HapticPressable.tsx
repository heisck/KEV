import { type ComponentProps } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  createAnimatedComponent,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { haptic, type HapticKind } from '@/lib/haptics';

type Props = ComponentProps<typeof Pressable> & {
  /** Feedback fired on press-in (Apple control feel). Default: tap. */
  haptic?: HapticKind;
};

const makeAnimated =
  createAnimatedComponent ?? Animated?.createAnimatedComponent ?? ((c: any) => c);
const AnimatedPressable = makeAnimated(Pressable);
const SPRING_CONFIG = { damping: 14, stiffness: 220, mass: 0.5 };

/**
 * Drop-in Pressable that fires tactile haptics and spring expansion on touch-down.
 * Provides clean, responsive Apple-like live button feedback across controls.
 */
export function HapticPressable({
  haptic: kind = 'tap',
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) {
          haptic(kind);
          scale.value = withSpring(1.04, SPRING_CONFIG);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1.0, SPRING_CONFIG);
        onPressOut?.(e);
      }}
      onPress={onPress}
      style={[style, animatedStyle]}
      {...rest}
    />
  );
}
