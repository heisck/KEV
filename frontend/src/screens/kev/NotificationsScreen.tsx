import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BackIcon,
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  FocusIcon,
  ProgressIcon,
  TrashIcon,
} from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { haptic } from '@/lib/haptics';
import {
  useNotificationsStore,
  type AppNotification,
  type NotificationDay,
  type NotificationIcon,
} from '@/store/notificationsStore';
import { radii, spacing, usePalette, type Palette } from '@/theme';

const FILTERS: { value: NotificationDay; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'earlier', label: 'Earlier' },
];

/** Circular lavender badge whose glyph reflects the notification kind. */
function Badge({ icon, p }: { icon: NotificationIcon; p: Palette }) {
  const glyph = {
    focus: <FocusIcon color={p.primary} size={20} />,
    progress: <ProgressIcon color={p.primary} size={20} />,
    complete: <CheckCircleIcon color={p.primary} size={20} />,
    break: <ClockIcon color={p.primary} size={18} />,
    reminder: <BellIcon color={p.primary} size={18} />,
  }[icon];
  return <View style={[styles.badge, { backgroundColor: p.mint }]}>{glyph}</View>;
}

/** One notification row; swipe left to reveal delete. */
function Row({
  item,
  p,
  onPress,
  onDelete,
}: {
  item: AppNotification;
  p: Palette;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Swipeable
      overshootRight={false}
      onSwipeableOpen={() => haptic('select')}
      renderRightActions={() => (
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title}`}
          haptic="warning"
          onPress={onDelete}
          style={[styles.delete, { backgroundColor: p.errorSoft }]}
        >
          <TrashIcon color={p.error} size={20} />
          <Text style={[styles.deleteText, { color: p.error }]}>Delete</Text>
        </HapticPressable>
      )}
    >
      <HapticPressable
        accessibilityRole="button"
        accessibilityLabel={item.title}
        haptic={item.read ? 'none' : 'select'}
        onPress={onPress}
        style={[
          styles.row,
          { backgroundColor: p.bg, borderBottomColor: p.hairline },
          !item.read && { backgroundColor: p.primary08 },
        ]}
      >
        <Badge icon={item.icon} p={p} />
        <View style={styles.text}>
          <Text style={[styles.title, { color: p.ink }]}>{item.title}</Text>
          <Text style={[styles.body, { color: p.muted }]}>{item.body}</Text>
        </View>
        <Text style={[styles.at, { color: p.muted }]}>{item.at}</Text>
      </HapticPressable>
    </Swipeable>
  );
}

/** Notification centre — filter by day, tap to read, swipe to delete. */
export function NotificationsScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const remove = useNotificationsStore((s) => s.remove);
  const [filter, setFilter] = useState<NotificationDay>('today');

  const visible = useMemo(() => items.filter((n) => n.day === filter), [items, filter]);

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.sm }]}>
      <View style={styles.header}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          haptic="select"
          onPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)'))}
          style={[styles.backBtn, { backgroundColor: p.surfaceDim }]}
        >
          <BackIcon color={p.ink} size={20} />
        </HapticPressable>
        <Text style={[styles.headerTitle, { color: p.ink }]}>Notification</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <HapticPressable
              key={f.value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              haptic="select"
              onPress={() => setFilter(f.value)}
              style={[styles.pill, { backgroundColor: active ? p.ink : p.surfaceDim }]}
            >
              <Text style={[styles.pillText, { color: active ? p.onPrimary : p.inkSoft }]}>
                {f.label}
              </Text>
            </HapticPressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        style={{ borderTopColor: p.hairline, borderTopWidth: StyleSheet.hairlineWidth }}
      >
        {visible.length > 0 ? (
          visible.map((n) => (
            <Row
              key={n.id}
              item={n}
              p={p}
              onPress={() => markRead(n.id)}
              onDelete={() => remove(n.id)}
            />
          ))
        ) : (
          <Text style={[styles.empty, { color: p.muted }]}>Nothing here yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const BADGE = 44;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pillText: { fontSize: 13, fontWeight: '700' },
  list: { paddingBottom: spacing.xxxl },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  badge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: BADGE,
    justifyContent: 'center',
    width: BADGE,
  },
  text: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  at: { alignSelf: 'flex-start', fontSize: 12, fontWeight: '500' },
  delete: {
    alignItems: 'center',
    gap: 2,
    justifyContent: 'center',
    width: 84,
  },
  deleteText: { fontSize: 12, fontWeight: '700' },
  empty: {
    fontSize: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    textAlign: 'center',
  },
});
