import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { deleteNotification, markNotificationRead } from '@/api/notifications';

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

const FULL_SWIPE_RATIO = 0.72;

function DoubleCheckIcon({ color }: { color: string }) {
  return (
    <Svg fill="none" height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="m3.5 12 4 4 7-8"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
      />
      <Path
        d="m9.5 16 2 2 9-10"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
      />
    </Svg>
  );
}

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

function DeleteAction({
  item,
  onDelete,
  p,
  threshold,
  translation,
}: {
  item: AppNotification;
  onDelete: () => void;
  p: Palette;
  threshold: number;
  translation: SharedValue<number>;
}) {
  const committed = useSharedValue(false);

  useAnimatedReaction(
    () => translation.value <= -threshold,
    (shouldDelete) => {
      if (shouldDelete && !committed.value) {
        committed.value = true;
        runOnJS(onDelete)();
      } else if (!shouldDelete) {
        committed.value = false;
      }
    },
    [onDelete, threshold],
  );

  return (
    <View style={[styles.deleteTrack, { backgroundColor: p.errorSoft }]}>
      <HapticPressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.title}`}
        haptic="warning"
        onPress={onDelete}
        style={styles.delete}
      >
        <TrashIcon color={p.error} size={20} />
        <Text style={[styles.deleteText, { color: p.error }]}>Delete</Text>
      </HapticPressable>
    </View>
  );
}

/** One notification row; swipe left to reveal or fully commit delete. */
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
  const { width } = useWindowDimensions();
  const fullSwipeDelete = useCallback(() => {
    haptic('warning');
    onDelete();
  }, [onDelete]);

  return (
    <ReanimatedSwipeable
      friction={1}
      overshootFriction={1}
      overshootRight
      onSwipeableOpen={() => haptic('select')}
      renderRightActions={(_progress, translation) => (
        <DeleteAction
          item={item}
          onDelete={fullSwipeDelete}
          p={p}
          threshold={width * FULL_SWIPE_RATIO}
          translation={translation}
        />
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
          <Text style={[styles.title, { color: item.read ? p.inkSoft : p.ink }]}>{item.title}</Text>
          <Text style={[styles.body, { color: p.muted }]}>{item.body}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.at, { color: p.muted }]}>{item.at}</Text>
          {!item.read ? (
            <View
              accessibilityLabel="Unread"
              style={[styles.unread, { backgroundColor: p.primary }]}
              testID={`notification-unread-${item.id}`}
            />
          ) : null}
        </View>
      </HapticPressable>
    </ReanimatedSwipeable>
  );
}

/** Notification centre — filter by day, tap to read, swipe to delete. */
export function NotificationsScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const items = useNotificationsStore((s) => s.items);
  const hasUnread = useNotificationsStore((s) => s.items.some((item) => !item.read));
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const markRead = useNotificationsStore((s) => s.markRead);
  const remove = useNotificationsStore((s) => s.remove);
  const [filter, setFilter] = useState<NotificationDay>('today');

  const visible = useMemo(() => items.filter((n) => n.day === filter), [items, filter]);
  const readOne = (id: string) => {
    markRead(id);
    void markNotificationRead(id).catch(() => undefined);
  };
  const readAll = () => {
    const unreadIds = items.filter((item) => !item.read).map((item) => item.id);
    markAllRead();
    void Promise.all(unreadIds.map(markNotificationRead)).catch(() => undefined);
  };
  const deleteOne = (id: string) => {
    remove(id);
    void deleteNotification(id).catch(() => undefined);
  };

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.sm }]}>
      <View style={styles.header}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          haptic="select"
          onPress={() => router.replace('/(tabs)')}
          style={[styles.backBtn, { backgroundColor: p.surfaceDim }]}
        >
          <BackIcon color={p.ink} size={20} />
        </HapticPressable>
        <Text style={[styles.headerTitle, { color: p.ink }]}>Notification</Text>
        <HapticPressable
          accessibilityLabel="Mark all notifications as read"
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasUnread }}
          disabled={!hasUnread}
          haptic="success"
          onPress={readAll}
          style={[styles.backBtn, { backgroundColor: p.surfaceDim }, !hasUnread && styles.disabled]}
        >
          <DoubleCheckIcon color={hasUnread ? p.primary : p.muted} />
        </HapticPressable>
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
              style={[styles.pill, { backgroundColor: active ? p.primary : p.surfaceDim }]}
              testID={`notification-filter-${f.value}`}
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
              onPress={() => readOne(n.id)}
              onDelete={() => deleteOne(n.id)}
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
  disabled: { opacity: 0.45 },
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
  meta: { alignItems: 'flex-end', gap: spacing.sm },
  at: { fontSize: 12, fontWeight: '500' },
  unread: { borderRadius: 4, height: 7, width: 7 },
  deleteTrack: { alignItems: 'flex-end', flex: 1 },
  delete: {
    alignItems: 'center',
    flex: 1,
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
