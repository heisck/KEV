import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type GlassSurfaceProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Blur strength for the non-liquid-glass fallback. */
  intensity?: number;
  testID?: string;
};

const canUseLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

/**
 * Single choke point for every translucent surface in the app.
 * iOS 26+: native liquid glass. Elsewhere: blur, then a plain translucent fill.
 */
export function GlassSurface({ children, style, intensity = 40, testID }: GlassSurfaceProps) {
  if (canUseLiquidGlass) {
    return (
      <GlassView style={style} testID={testID}>
        {children}
      </GlassView>
    );
  }
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return (
      <BlurView
        intensity={intensity}
        tint="light"
        style={[styles.blurFallback, style]}
        testID={testID}
      >
        {children}
      </BlurView>
    );
  }
  return (
    <View style={[styles.solidFallback, style]} testID={testID}>
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
