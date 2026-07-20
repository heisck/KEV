import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { spacing, usePalette } from '@/theme';

/** Only these routes appear in the bottom nav. Everything else is excluded. */
const TAB_BAR_ROUTES = new Set(['index', 'reminders', 'create', 'chat', 'profile']);

/** Bottom bar with glass surface; selection haptic on tab change. */
export function KevTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const p = usePalette();

  return (
    <GlassSurface
      glassEffectStyle="regular"
      fallbackColor={p.surface}
      style={[
        styles.bar,
        { borderTopColor: p.hairline, paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {state.routes.map((route, index) => {
        if (!TAB_BAR_ROUTES.has(route.name)) return null;

        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const tint = isFocused ? p.primary : p.muted;

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
            accessibilityLabel={options.tabBarAccessibilityLabel ?? options.title ?? route.name}
            haptic="select"
            testID={`tab-${route.name}`}
            onPress={onPress}
            style={styles.tab}
          >
            {options.tabBarIcon?.({ focused: isFocused, color: tint, size: 24 })}
            <Text style={[styles.label, { color: tint }]}>{options.title ?? route.name}</Text>
          </HapticPressable>
        );
      })}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  tab: { alignItems: 'center', flex: 1, gap: 3, paddingVertical: spacing.xs },
  label: { fontSize: 10, fontWeight: '600' },
});
