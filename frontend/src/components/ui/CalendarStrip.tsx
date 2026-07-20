import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalendarStripProps = {
  /** Center date of the strip; defaults to today. */
  today?: Date;
  selected?: Date;
  onSelect?: (date: Date) => void;
  /** Dates that carry a dot marker (e.g. days with sessions). */
  markedDates?: Date[];
  testID?: string;
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Horizontal week strip with active day pill, Roam-calendar style. */
export function CalendarStrip({
  today = new Date(),
  selected,
  onSelect,
  markedDates = [],
  testID,
}: CalendarStripProps) {
  const p = usePalette();
  const active = selected ?? today;
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      testID={testID}
    >
      {week.map((date) => {
        const isActive = sameDay(date, active);
        const isMarked = markedDates.some((m) => sameDay(m, date));
        return (
          <HapticPressable
            key={date.toISOString()}
            accessibilityRole="button"
            haptic="select"
            onPress={onSelect ? () => onSelect(date) : undefined}
            style={[
              styles.day,
              { backgroundColor: p.surface },
              isActive && { backgroundColor: p.ink },
            ]}
          >
            <Text style={[styles.dayLabel, { color: isActive ? p.bg : p.muted }]}>
              {DAY_LABELS[date.getDay()]}
            </Text>
            <Text style={[styles.dayNumber, { color: isActive ? p.bg : p.ink }]}>
              {date.getDate()}
            </Text>
            <View style={[styles.dot, isMarked && { backgroundColor: p.primary }]} />
          </HapticPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  day: {
    alignItems: 'center',
    borderRadius: radii.md,
    gap: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dayLabel: { fontSize: 11, fontWeight: '600' },
  dayNumber: { fontSize: 16, fontWeight: '800' },
  dot: { backgroundColor: 'transparent', borderRadius: 2, height: 4, width: 4 },
});
