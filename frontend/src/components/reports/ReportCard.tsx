import { useCallback } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import type { StudentReport } from '@/api/schemas';
import { ReportIcon, TrashIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { haptic } from '@/lib/haptics';
import { radii, spacing, type Palette } from '@/theme';

const FULL_SWIPE_RATIO = 0.72;

function getSnippet(markup: string): string {
  if (!markup) return '';
  return markup
    .replace(/\*\*|~~|_|<\/?(?:u|left|right)>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function DeleteAction({
  item,
  onDelete,
  palette,
  threshold,
  translation,
}: {
  item: StudentReport;
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
        accessibilityLabel={`Delete report ${item.id}`}
        accessibilityRole="button"
        haptic="warning"
        onPress={onDelete}
        style={styles.delete}
        testID={`report-delete-${item.id}`}
      >
        <TrashIcon color={palette.error} size={20} />
        <Text style={[styles.deleteText, { color: palette.error }]}>Delete</Text>
      </HapticPressable>
    </View>
  );
}

export function ReportCard({
  item,
  palette: p,
  onPress,
  onDelete,
}: {
  item: StudentReport;
  palette: Palette;
  onPress: () => void;
  onDelete?: () => void;
}) {
  const { width } = useWindowDimensions();
  const title = item.authorName || 'Invigilator';
  const subtitle = getSnippet(item.message);
  const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const fullSwipeDelete = useCallback(() => {
    if (!onDelete) return;
    haptic('warning');
    onDelete();
  }, [onDelete]);

  const content = (
    <HapticPressable
      accessibilityRole="button"
      haptic={item.read ? 'none' : 'select'}
      onPress={onPress}
      style={[
        styles.row,
        { backgroundColor: p.bg, borderBottomColor: p.hairline },
        !item.read && { backgroundColor: p.primary08 },
      ]}
      testID={`report-card-${item.id}`}
    >
      {item.student?.photoUrl ? (
        <Image source={{ uri: item.student.photoUrl }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.badge, { backgroundColor: p.mint }]}>
          <ReportIcon color={p.primary} size={20} />
        </View>
      )}

      <View style={styles.textColumn}>
        <View style={styles.headerRow}>
          <Text numberOfLines={1} style={[styles.title, { color: p.ink }]}>
            {title}
          </Text>
          {item.sessionCode ? (
            <View style={[styles.codePill, { backgroundColor: p.surfaceDim }]}>
              <Text style={[styles.codeText, { color: p.muted }]}>{item.sessionCode}</Text>
            </View>
          ) : null}
        </View>

        <Text numberOfLines={2} style={[styles.bodySnippet, { color: p.inkSoft }]}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.metaColumn}>
        <Text style={[styles.timeText, { color: p.muted }]}>{dateStr}</Text>
        {!item.read ? (
          <View
            accessibilityLabel="Unread"
            style={[styles.unread, { backgroundColor: p.primary }]}
            testID={`report-unread-${item.id}`}
          />
        ) : null}
      </View>
    </HapticPressable>
  );

  if (!onDelete) return content;

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
          palette={p}
          threshold={width * FULL_SWIPE_RATIO}
          translation={translation}
        />
      )}
    >
      {content}
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
  avatar: {
    borderRadius: radii.pill,
    height: 44,
    width: 44,
  },
  textColumn: { flex: 1, gap: 3 },
  headerRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  title: { fontSize: 15, fontWeight: '700' },
  codePill: { borderRadius: radii.sm, paddingHorizontal: 6, paddingVertical: 2 },
  codeText: { fontSize: 10, fontWeight: '700' },
  bodySnippet: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  metaColumn: { alignItems: 'flex-end', gap: spacing.sm },
  timeText: { fontSize: 12, fontWeight: '500' },
  unread: { borderRadius: radii.pill, height: 8, width: 8 },
  deleteTrack: { alignItems: 'flex-end', flex: 1 },
  delete: { alignItems: 'center', flex: 1, gap: 2, justifyContent: 'center', width: 84 },
  deleteText: { fontSize: 12, fontWeight: '700' },
});
