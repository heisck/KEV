import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Keyframe, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { useToastStore, type ToastTone } from '@/lib/toast';
import { radii, shadows, spacing, usePalette } from '@/theme';

// Translate/scale only, never opacity: GlassView (iOS 26) stops rendering while any
// ancestor has opacity < 1, so fading would flicker the glass. The overshoot on the
// enter keyframe gives the bounce without ever touching opacity.
const enterToast = new Keyframe({
  0: { transform: [{ translateY: -14 }, { scale: 0.96 }] },
  55: { transform: [{ translateY: 3 }, { scale: 1.02 }] },
  100: { transform: [{ translateY: 0 }, { scale: 1 }] },
}).duration(360);
const exitToast = new Keyframe({
  0: { transform: [{ translateY: 0 }, { scale: 1 }] },
  100: { transform: [{ translateY: -12 }, { scale: 0.98 }] },
}).duration(160);

/** Floating glass toast stack. Mount once at the app root, above navigation. */
export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const { top } = useSafeAreaInsets();
  const p = usePalette();

  if (toasts.length === 0) return null;

  const toneDots: Record<ToastTone, string> = {
    success: p.success,
    error: p.error,
    info: p.primary,
  };

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: top + spacing.md }]}>
      {toasts.map((item) => (
        <Animated.View
          key={item.id}
          entering={enterToast}
          exiting={exitToast}
          layout={LinearTransition}
        >
          <Pressable accessibilityRole="alert" onPress={() => dismiss(item.id)}>
            <GlassSurface intensity={60} style={styles.pill}>
              <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: toneDots[item.tone] }]} />
                <Text numberOfLines={2} style={[styles.message, { color: p.ink }]}>
                  {item.message}
                </Text>
              </View>
            </GlassSurface>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    alignItems: 'center',
    gap: spacing.sm,
    left: spacing.xl,
    position: 'absolute',
    right: spacing.xl,
    zIndex: 1000,
  },
  pill: {
    borderRadius: radii.pill,
    ...shadows.floating,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dot: { borderRadius: 4, height: 8, width: 8 },
  message: { flexShrink: 1, fontSize: 14, fontWeight: '600' },
});
