import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { useConversations } from '@/api/hooks';
import { useNotificationsStore } from '@/store/notificationsStore';
import { spacing, usePalette } from '@/theme';

/** Only these routes appear in the bottom nav. Everything else is excluded. */
const TAB_BAR_ROUTES = new Set(['index', 'reminders', 'create', 'chat', 'profile']);

/** Bottom bar with glass surface; selection haptic on tab change. */
export function KevTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const p = usePalette();
  const { data: conversations = [] } = useConversations();
  const chatUnread = conversations.reduce((total, item) => total + item.unreadCount, 0);
  const reminderUnread = useNotificationsStore(
    (state) => state.items.filter((item) => !item.read).length,
  );

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
        const badge =
          route.name === 'chat' ? chatUnread : route.name === 'reminders' ? reminderUnread : 0;

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
            <View style={styles.iconSlot}>
              {options.tabBarIcon?.({ focused: isFocused, color: tint, size: 24 })}
              {badge > 0 ? (
                <View style={[styles.badge, { backgroundColor: p.primary }]}>
                  <Text style={[styles.badgeText, { color: p.onPrimary }]}>
                    {Math.min(99, badge)}
                  </Text>
                </View>
              ) : null}
            </View>
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
  iconSlot: { position: 'relative' },
  badge: {
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 16,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -9,
    top: -5,
  },
  badgeText: { fontSize: 9, fontWeight: '900', lineHeight: 14 },
});
