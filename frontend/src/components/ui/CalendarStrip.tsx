import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

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
          <Pressable
            key={date.toISOString()}
            accessibilityRole="button"
            onPress={onSelect ? () => onSelect(date) : undefined}
            style={[styles.day, isActive && styles.dayActive]}
          >
            <Text style={[styles.dayLabel, isActive && styles.dayTextActive]}>
              {DAY_LABELS[date.getDay()]}
            </Text>
            <Text style={[styles.dayNumber, isActive && styles.dayTextActive]}>
              {date.getDate()}
            </Text>
            <View style={[styles.dot, isMarked && styles.dotVisible]} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  day: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    gap: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dayActive: { backgroundColor: colors.black },
  dayLabel: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  dayNumber: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  dayTextActive: { color: colors.white },
  dot: { backgroundColor: 'transparent', borderRadius: 2, height: 4, width: 4 },
  dotVisible: { backgroundColor: colors.primary },
});
