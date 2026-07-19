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
import { colors, radii, spacing } from '@/theme';

/** Exam list card: image · course/date/status · favorite, then checklist + action. */
export function ExamCard({ exam }: { exam: Exam }) {
  const router = useRouter();
  const isFavorite = useFavoritesStore((s) => s.ids.has(exam.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.image}>
          <SceneArt art={exam.art} />
        </View>
        <View style={styles.headings}>
          <Text style={styles.city}>{exam.course}</Text>
          <Text style={styles.dates}>{exam.dates}</Text>
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
          <BookmarkIcon color={isFavorite ? colors.primary : colors.ink} />
        </HapticPressable>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.checklist}>
          {exam.checklist.map((item) => (
            <View key={item.label} style={styles.checkItem}>
              {item.kind === 'done' ? (
                <CheckCircleIcon color={colors.success} />
              ) : (
                <AlertIcon color={colors.error} />
              )}
              <Text style={styles.checkLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {exam.action === 'session' ? (
          <HapticPressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/exam/[id]', params: { id: exam.id } })}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Open session</Text>
          </HapticPressable>
        ) : (
          <HapticPressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/group-session', params: { exam: exam.id } })}
            style={styles.guests}
          >
            <StudentsIcon color={colors.ink} />
            <Text style={styles.guestsText}>{exam.action} students</Text>
            <ChevronRightIcon color={colors.ink} />
          </HapticPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  topRow: { flexDirection: 'row', gap: spacing.md },
  image: { borderRadius: radii.md, height: 96, overflow: 'hidden', width: 96 },
  headings: { flex: 1, gap: 6 },
  city: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  dates: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  bottomRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between' },
  checklist: { gap: spacing.sm },
  checkItem: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  checkLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  ctaText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  guests: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingVertical: spacing.xs },
  guestsText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
});
