import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

type CardProps = {
  children: React.ReactNode;
  /** 'surface' = white card, 'mint' = brand-tinted, 'ink' = dark CTA card. */
  variant?: 'surface' | 'mint' | 'ink';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Card({ children, variant = 'surface', style, testID }: CardProps) {
  return (
    <View style={[styles.base, variantStyles[variant], style]} testID={testID}>
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

const variantStyles = StyleSheet.create({
  surface: { backgroundColor: colors.surface },
  mint: { backgroundColor: colors.mint },
  ink: { backgroundColor: colors.black },
});
