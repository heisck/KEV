import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { GlassPressable } from '@/components/ui/GlassPressable';
import { radii, spacing, usePalette } from '@/theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ink' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * App button using Liquid Glass that ships in this build (`ExpoGlassEffect`).
 *
 * Why not `@expo/ui` SwiftUI Button?
 * That needs the native `ExpoUI` module (dev rebuild). This binary only
 * exports `ExpoGlassEffect` / `GlassView`, so we use interactive GlassView
 * for the glass path and solid pills elsewhere.
 *
 * - primary / ink / danger → regular interactive glass + soft tint
 * - ghost → clear interactive glass
 * - Light impact haptic on press (via GlassPressable)
 */
export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  testID,
}: AppButtonProps) {
  const p = usePalette();
  const tint =
    variant === 'primary'
      ? p.primary
      : variant === 'ink'
        ? p.ink
        : variant === 'danger'
          ? p.error
          : p.primary12;

  const labelColor = variant === 'ghost' ? p.primaryDeep : p.onPrimary;

  return (
    <GlassPressable
      disabled={disabled}
      onPress={onPress}
      style={style}
      surfaceStyle={styles.surface}
      tintColor={tint}
      glassEffectStyle={variant === 'ghost' ? 'clear' : 'regular'}
      testID={testID}
    >
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </GlassPressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    alignItems: 'center',
    borderRadius: radii.pill,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.xxl,
    paddingVertical: 14,
  },
  label: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
