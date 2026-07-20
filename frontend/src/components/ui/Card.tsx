import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radii, shadows, spacing, usePalette } from '@/theme';

type CardProps = {
  children: React.ReactNode;
  /** 'surface' = white card, 'mint' = brand-tinted, 'ink' = dark CTA card. */
  variant?: 'surface' | 'mint' | 'ink';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Card({ children, variant = 'surface', style, testID }: CardProps) {
  const p = usePalette();
  const variantColor = { surface: p.surface, mint: p.mint, ink: p.ink };
  return (
    <View style={[styles.base, { backgroundColor: variantColor[variant] }, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: spacing.xl,
    ...shadows.card,
  },
});
