import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { SceneArt } from '@/components/kev/art';
import { StatusChip } from '@/components/kev/chrome';
import {
  AlertIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  StudentsIcon,
} from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import type { Exam } from '@/data/exams';
import { toast } from '@/lib/toast';
import { useFavoritesStore } from '@/store/favoritesStore';
import { radii, spacing, usePalette } from '@/theme';

/** Exam list card: image · course/date/status · favorite, then checklist + action. */
export function ExamCard({ exam }: { exam: Exam }) {
  const router = useRouter();
  const p = usePalette();
  const isFavorite = useFavoritesStore((s) => s.ids.has(exam.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  return (
    <View style={[styles.card, { backgroundColor: p.surfaceDim }]}>
      <View style={styles.topRow}>
        <View style={styles.image}>
          <SceneArt art={exam.art} />
        </View>
        <View style={styles.headings}>
          <Text ellipsizeMode="tail" numberOfLines={2} style={[styles.city, { color: p.ink }]}>
            {exam.course}
          </Text>
          <Text style={[styles.dates, { color: p.muted }]}>{exam.dates}</Text>
          {exam.status !== 'Past' ? <StatusChip status={exam.status} /> : null}
        </View>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? `Remove ${exam.course} from favorites` : `Save ${exam.course}`
          }
          accessibilityState={{ selected: isFavorite }}
          hitSlop={8}
          haptic="select"
          onPress={() => {
            toggleFavorite(exam.id);
            toast.info(isFavorite ? 'Removed from favorites' : 'Added to favorites');
          }}
        >
          <BookmarkIcon color={isFavorite ? p.primary : p.ink} />
        </HapticPressable>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.checklist}>
          {exam.checklist.map((item) => (
            <View key={item.label} style={styles.checkItem}>
              {item.kind === 'done' ? (
                <CheckCircleIcon color={p.success} />
              ) : (
                <AlertIcon color={p.error} />
              )}
              <Text numberOfLines={2} style={[styles.checkLabel, { color: p.inkSoft }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {exam.action === 'session' ? (
          <HapticPressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/exam/[id]', params: { id: exam.id } })}
            style={[styles.cta, { backgroundColor: p.primary }]}
          >
            <Text style={[styles.ctaText, { color: p.onPrimary }]}>Open session</Text>
          </HapticPressable>
        ) : (
          <HapticPressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/exam/[id]', params: { id: exam.id } })}
            style={styles.guests}
          >
            <StudentsIcon color={p.ink} />
            <Text style={[styles.guestsText, { color: p.ink }]}>{exam.action} students</Text>
            <ChevronRightIcon color={p.ink} />
          </HapticPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  topRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  image: { borderRadius: radii.md, flexShrink: 0, height: 96, overflow: 'hidden', width: 96 },
  headings: { flex: 1, gap: 6, minWidth: 0 },
  city: { flexShrink: 1, fontSize: 22, fontWeight: '800' },
  dates: { fontSize: 13, fontWeight: '500' },
  bottomRow: { alignItems: 'flex-end', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  checklist: { flex: 1, gap: spacing.sm, minWidth: 160 },
  checkItem: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, minWidth: 0 },
  checkLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  cta: {
    flexShrink: 0,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  ctaText: { fontSize: 13, fontWeight: '700' },
  guests: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
    marginLeft: 'auto',
    paddingVertical: spacing.xs,
  },
  guestsText: { fontSize: 13, fontWeight: '700' },
});
