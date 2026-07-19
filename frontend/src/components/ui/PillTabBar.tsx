import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { colors, radii, shadows, spacing } from '@/theme';

/**
 * Floating pill tab bar (Roam template) on a glass surface with an
 * active-dot indicator. Wire via <Tabs tabBar={(p) => <PillTabBar {...p} />}>.
 */
export function PillTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: insets.bottom + 10 }]}>
      <GlassSurface style={styles.pill}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            // Routes hidden via expo-router's `href: null` stay in state — skip them
            // so they don't occupy an empty slot and skew the pill's centering.
            if ((options as { href?: string | null }).href === null) return null;
            const isFocused = state.index === index;
            const icon = options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? colors.ink : colors.muted,
              size: 24,
            });

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <HapticPressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
                haptic="select"
                testID={`tab-${route.name}`}
                onPress={onPress}
                style={styles.tab}
              >
                {icon}
                {isFocused ? <Animated.View entering={FadeIn} style={styles.dot} /> : null}
              </HapticPressable>
            );
          })}
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  pill: {
    borderRadius: radii.pill,
    ...shadows.floating,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tab: {
    alignItems: 'center',
    gap: 3,
    minWidth: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dot: { backgroundColor: colors.primary, borderRadius: 2.5, height: 5, width: 5 },
});
