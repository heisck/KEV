import { useCallback } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import {
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  FocusIcon,
  ProgressIcon,
  TrashIcon,
} from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { haptic } from '@/lib/haptics';
import type { AppNotification, NotificationIcon } from '@/store/notificationsStore';
import { radii, spacing, type Palette } from '@/theme';

const FULL_SWIPE_RATIO = 0.72;

function Badge({ icon, palette }: { icon: NotificationIcon; palette: Palette }) {
  const glyph = {
    focus: <FocusIcon color={palette.primary} size={20} />,
    progress: <ProgressIcon color={palette.primary} size={20} />,
    complete: <CheckCircleIcon color={palette.primary} size={20} />,
    break: <ClockIcon color={palette.primary} size={18} />,
    reminder: <BellIcon color={palette.primary} size={18} />,
  }[icon];
  return <View style={[styles.badge, { backgroundColor: palette.mint }]}>{glyph}</View>;
}

function DeleteAction({
  item,
  onDelete,
  palette,
  threshold,
  translation,
}: {
  item: AppNotification;
  onDelete: () => void;
  palette: Palette;
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
      } else if (!shouldDelete) committed.value = false;
    },
    [onDelete, threshold],
  );
  return (
    <View style={[styles.deleteTrack, { backgroundColor: palette.errorSoft }]}>
      <HapticPressable
        accessibilityLabel={`Delete ${item.title}`}
        accessibilityRole="button"
        haptic="warning"
        onPress={onDelete}
        style={styles.delete}
      >
        <TrashIcon color={palette.error} size={20} />
        <Text style={[styles.deleteText, { color: palette.error }]}>Delete</Text>
      </HapticPressable>
    </View>
  );
}

/** Notification row with reveal and full-swipe delete actions. */
export function NotificationRow({
  item,
  palette,
  onPress,
  onDelete,
}: {
  item: AppNotification;
  palette: Palette;
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
      onSwipeableOpen={() => haptic('select')}
      overshootFriction={1}
      overshootRight
      renderRightActions={(_progress, translation) => (
        <DeleteAction
          item={item}
          onDelete={fullSwipeDelete}
          palette={palette}
          threshold={width * FULL_SWIPE_RATIO}
          translation={translation}
        />
      )}
    >
      <HapticPressable
        accessibilityLabel={item.title}
        accessibilityRole="button"
        haptic={item.read ? 'none' : 'select'}
        onPress={onPress}
        style={[
          styles.row,
          { backgroundColor: palette.bg, borderBottomColor: palette.hairline },
          !item.read && { backgroundColor: palette.primary08 },
        ]}
      >
        <Badge icon={item.icon} palette={palette} />
        <View style={styles.text}>
          <Text style={[styles.title, { color: item.read ? palette.inkSoft : palette.ink }]}>
            {item.title}
          </Text>
          <Text style={[styles.body, { color: palette.muted }]}>{item.body}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={[styles.at, { color: palette.muted }]}>{item.at}</Text>
          {!item.read ? (
            <View
              accessibilityLabel="Unread"
              style={[styles.unread, { backgroundColor: palette.primary }]}
              testID={`notification-unread-${item.id}`}
            />
          ) : null}
        </View>
      </HapticPressable>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
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
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  text: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  meta: { alignItems: 'flex-end', gap: spacing.sm },
  at: { fontSize: 12, fontWeight: '500' },
  unread: { borderRadius: 4, height: 7, width: 7 },
  deleteTrack: { alignItems: 'flex-end', flex: 1 },
  delete: { alignItems: 'center', flex: 1, gap: 2, justifyContent: 'center', width: 84 },
  deleteText: { fontSize: 12, fontWeight: '700' },
});
