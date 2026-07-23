import { type ReactNode } from 'react';
import { Pressable, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  createAnimatedComponent,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GlassSurface, isGlassReady } from '@/components/ui/GlassSurface';
import { haptic, type HapticKind } from '@/lib/haptics';

type GlassPressableProps = {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Geometry of the glass material (pill / circle / card). */
  surfaceStyle?: StyleProp<ViewStyle>;
  /**
   * Soft brand tint — Apple tints glass, never paints an opaque slab.
   * Prefer translucent colors (e.g. rgba). Solid hex is softened automatically.
   */
  tintColor?: string;
  /** `regular` ≈ glass material; `clear` ≈ more transparent (secondary). */
  glassEffectStyle?: 'regular' | 'clear';
  haptic?: HapticKind;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  testID?: string;
};

const makeAnimated =
  createAnimatedComponent ?? Animated?.createAnimatedComponent ?? ((c: any) => c);
const AnimatedPressable = makeAnimated(Pressable);
const SPRING_CONFIG = { damping: 14, stiffness: 220, mass: 0.5 };

/** Soften a #RRGGBB tint so liquid glass still refracts (Apple: tint, not fill). */
function glassTint(color?: string): string | undefined {
  if (!color) return undefined;
  if (color.startsWith('rgba') || color.startsWith('rgb') || color.startsWith('#')) {
    if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
      const hex =
        color.length === 4
          ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
          : color;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},0.55)`;
    }
  }
  return color;
}

/**
 * Custom control with Liquid Glass press morph & spring expansion.
 *
 * Apple Liquid Glass & Interactive Touch Model:
 * - Tapping & holding expands the control slightly (scale: 1.04) with tactile spring physics.
 * - Interactive glass material refracts background content on iOS.
 * - Light haptic fires on press-in for an instant physical feel.
 */
export function GlassPressable({
  children,
  onPress,
  disabled = false,
  style,
  surfaceStyle,
  tintColor,
  glassEffectStyle = 'regular',
  haptic: kind = 'tap',
  accessibilityLabel,
  accessibilityRole = 'button',
  testID,
}: GlassPressableProps) {
  const glass = isGlassReady();
  const tint = glass ? glassTint(tintColor) : tintColor;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    haptic(kind);
    scale.value = withSpring(1.04, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0, SPRING_CONFIG);
  };

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      testID={testID}
      onPress={() => {
        if (disabled) return;
        onPress?.();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle, !glass && disabled ? { opacity: 0.45 } : null]}
    >
      <GlassSurface
        key={`glass-${glassEffectStyle}-${Boolean(tint)}`}
        interactive={glass}
        glassEffectStyle={glassEffectStyle}
        tintColor={tint}
        fallbackColor={tintColor}
        style={[surfaceStyle, glass && disabled ? { opacity: 1 } : null]}
      >
        {children}
      </GlassSurface>
    </AnimatedPressable>
  );
}
