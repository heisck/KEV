import { type ReactNode } from 'react';
import { Pressable, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';

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
 * Custom control with Liquid Glass press morph (iOS 26).
 *
 * Apple (Applying Liquid Glass to custom views):
 * - use interactive glass for touch-reactive materials
 * - assign a tint for prominence, not a solid background
 * - do not put opacity < 1 on the glass node or its parents
 *
 * Expo: `GlassView` + `isInteractive` via GlassSurface (ExpoGlassEffect).
 * Available in this app's native binary (ExpoUI is not linked).
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

  // When liquid glass is live, skip JS scale / parent opacity — the system
  // interactive morph is the press feel (Apple/Expo: don't fight the material).
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      testID={testID}
      onPress={() => {
        if (disabled) return;
        haptic(kind);
        onPress?.();
      }}
      style={({ pressed }) => [
        style,
        !glass && pressed && !disabled ? { transform: [{ scale: 0.98 }] } : null,
        // Never opacity-dim GlassView parents (breaks the effect). Dim only fallbacks.
        !glass && disabled ? { opacity: 0.45 } : null,
      ]}
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
    </Pressable>
  );
}
