import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radii, spacing, usePalette } from '@/theme';

type SkeletonVariant = 'cards' | 'detail' | 'rows';

const BLOCKS: Record<SkeletonVariant, number[]> = {
  cards: [150, 150, 150],
  detail: [220, 72, 72],
  rows: [64, 64, 64, 64, 64],
};

type LoadingSkeletonProps = {
  variant?: SkeletonVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Lightweight first-load placeholder shared by network-backed screens. */
export function LoadingSkeleton({ variant = 'rows', style, testID }: LoadingSkeletonProps) {
  const p = usePalette();

  return (
    <View
      accessibilityLabel="Loading content"
      accessibilityRole="progressbar"
      style={[styles.container, style]}
      testID={testID}
    >
      {BLOCKS[variant].map((height, index) => (
        <View
          key={`${variant}-${index}`}
          style={[styles.block, { backgroundColor: p.primary08, height }]}
          testID="skeleton-block"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, width: '100%' },
  block: { borderRadius: radii.lg, opacity: 0.75 },
});
