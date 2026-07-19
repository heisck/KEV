import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type GlassSurfaceProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Blur strength for the non-liquid-glass fallback. */
  intensity?: number;
  /** Tint blended into the glass on iOS 26 (Apple allows a tint, not a solid fill). */
  tintColor?: string;
  /** Solid colour for the blur/plain fallback when liquid glass is unavailable. */
  fallbackColor?: string;
  /**
   * Native interactive press morph on iOS 26 (UIKit).
   * Must be fixed for the lifetime of the view — remount with a new key to change.
   */
  interactive?: boolean;
  /** `regular` (default material) or `clear` (more transparent). */
  glassEffectStyle?: 'regular' | 'clear';
  testID?: string;
};

/** iOS 26 liquid glass, guarded: probes can throw on betas / tests. */
export function isGlassReady(): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

/**
 * Single choke point for every translucent surface.
 * iOS 26+: native liquid glass. Elsewhere: blur, then a plain translucent fill.
 * Do not set opacity < 1 on this node or parents when glass is active (Apple/Expo).
 */
export function GlassSurface({
  children,
  style,
  intensity = 40,
  tintColor,
  fallbackColor,
  interactive = false,
  glassEffectStyle = 'regular',
  testID,
}: GlassSurfaceProps) {
  if (isGlassReady()) {
    // Apple/Expo: never put opacity < 1 on GlassView or ancestors.
    // Interactive must be fixed at mount (remount with key to change).
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle={glassEffectStyle}
        isInteractive={interactive}
        style={style}
        testID={testID}
        tintColor={tintColor}
      >
        {children}
      </GlassView>
    );
  }
  const fill = fallbackColor ? { backgroundColor: fallbackColor } : null;
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return (
      <BlurView
        intensity={intensity}
        style={[styles.blurFallback, fill, style]}
        testID={testID}
        tint="light"
      >
        {children}
      </BlurView>
    );
  }
  return (
    <View style={[styles.solidFallback, fill, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blurFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    overflow: 'hidden',
  },
  solidFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
  },
});
