import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { deleteNotification, markNotificationRead } from '@/api/notifications';
import { logger } from '@/lib/logger';

import { BackIcon } from '@/components/kev/icons';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import { DoubleCheckIcon } from '@/components/notifications/DoubleCheckIcon';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { notificationsScreenStyles as styles } from '@/screens/kev/notificationsScreenStyles';
import { useNotificationsStore, type NotificationDay } from '@/store/notificationsStore';
import { spacing, usePalette } from '@/theme';

const FILTERS: { value: NotificationDay; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'earlier', label: 'Earlier' },
];
const STATUS_FILTERS = [
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
] as const;
type NotificationStatus = (typeof STATUS_FILTERS)[number]['value'];
type NotificationFilter = NotificationDay | NotificationStatus;
const ALL_FILTERS: { value: NotificationFilter; label: string }[] = [...FILTERS, ...STATUS_FILTERS];

/** Notification centre — filter by day, tap to read, swipe to delete. */
export function NotificationsScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const items = useNotificationsStore((s) => s.items);
  const loaded = useNotificationsStore((s) => s.loaded);
  const hasUnread = useNotificationsStore((s) => s.items.some((item) => !item.read));
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const markRead = useNotificationsStore((s) => s.markRead);
  const remove = useNotificationsStore((s) => s.remove);
  const [filter, setFilter] = useState<NotificationFilter>('today');

  const visible = useMemo(
    () =>
      items.filter((item) => {
        if (filter === 'read') return item.read;
        if (filter === 'unread') return !item.read;
        return item.day === filter;
      }),
    [filter, items],
  );
  const readOne = (id: string) => {
    markRead(id);
    void markNotificationRead(id).catch((error: unknown) =>
      logger.warn('Failed to mark notification read', { error: String(error), id }),
    );
  };
  const openNotification = (id: string) => {
    const item = items.find((notification) => notification.id === id);
    readOne(id);
    if (item?.kind === 'CHAT' && item.targetId) {
      router.push({ pathname: '/chat/[id]', params: { id: item.targetId } });
    } else if (item?.kind === 'REPORT' && item.targetId) {
      router.push({ pathname: '/reports', params: { report: item.targetId } });
    } else if (item?.kind === 'SESSION' && item.targetId) {
      router.push({ pathname: '/exam/[id]', params: { id: item.targetId } });
    }
  };
  const readAll = () => {
    const unreadIds = items.filter((item) => !item.read).map((item) => item.id);
    markAllRead();
    void Promise.all(unreadIds.map(markNotificationRead)).catch((error: unknown) =>
      logger.warn('Failed to mark all notifications read', { error: String(error) }),
    );
  };
  const deleteOne = (id: string) => {
    remove(id);
    void deleteNotification(id).catch((error: unknown) =>
      logger.warn('Failed to delete notification', { error: String(error), id }),
    );
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterScroll}
      >
        {ALL_FILTERS.map((f) => {
          const active = filter === f.value;
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
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        style={[styles.listBorder, { borderTopColor: p.hairline }]}
      >
        {!loaded ? (
          <LoadingSkeleton style={styles.skeleton} testID="notifications-skeleton" variant="rows" />
        ) : visible.length > 0 ? (
          visible.map((n) => (
            <NotificationRow
              key={n.id}
              item={n}
              palette={p}
              onPress={() => openNotification(n.id)}
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
