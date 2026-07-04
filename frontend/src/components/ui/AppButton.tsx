import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, pressedScale, radii, spacing, springs } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ink' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Spring pressed-scale + haptic tap; the app's single button primitive. */
export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  testID,
}: AppButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      testID={testID}
      onPressIn={() => {
        scale.value = withSpring(pressedScale, springs.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.press);
      }}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={[styles.base, variants[variant], disabled && styles.disabled, animatedStyle, style]}
    >
      <Text style={[styles.label, labelVariants[variant]]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
  },
  label: { fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});

const variants = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  ink: { backgroundColor: colors.black },
  ghost: { backgroundColor: colors.primary12 },
  danger: { backgroundColor: colors.error },
});

const labelVariants = StyleSheet.create({
  primary: { color: colors.white },
  ink: { color: colors.white },
  ghost: { color: colors.primaryDeep },
  danger: { color: colors.white },
});
