import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessions } from '@/api/hooks';
import { CircleButton } from '@/components/kev/chrome';
import { BellIcon, SearchIcon } from '@/components/kev/icons';
import { Avatar } from '@/components/kev/people';
import { ExamCard } from '@/components/kev/ExamCard';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { JoinSessionButton } from '@/components/session/JoinSessionButton';
import { matchesExamQuery, sessionToExam, type ExamStatus } from '@/data/exams';
import { useAuthStore } from '@/store/authStore';
import { radii, spacing, usePalette } from '@/theme';

const FILTERS = ['All', 'Upcoming', 'Ongoing', 'Past'] as const;
type Filter = (typeof FILTERS)[number];

/** Home — welcome header, session search, exam filters, exam cards (kev mockup screen 1). */
export function HomeScreen() {
  const router = useRouter();
  const p = usePalette();
  const user = useAuthStore((s) => s.user);
  const { top } = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');

  const { data: rawSessions } = useSessions();
  const exams = useMemo(() => {
    const list = rawSessions?.map(sessionToExam) ?? [];
    return list.filter(
      (e) =>
        (filter === 'All' || e.status === (filter as ExamStatus)) && matchesExamQuery(e, query),
    );
  }, [rawSessions, filter, query]);

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <View style={styles.header}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          haptic="select"
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Avatar person="me" size={44} />
        </HapticPressable>
        <View style={styles.welcome}>
          <Text style={[styles.welcomeLabel, { color: p.muted }]}>Welcome back</Text>
          <Text style={[styles.name, { color: p.ink }]}>{user?.displayName ?? 'Invigilator'}</Text>
        </View>
        <CircleButton label="Notifications" onPress={() => router.push('/(tabs)/reminders')}>
          <BellIcon color={p.ink} />
        </CircleButton>
      </View>

      <View style={[styles.search, { backgroundColor: p.surfaceDim }]}>
        <SearchIcon color={p.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by class or session ID"
          placeholderTextColor={p.muted}
          autoCapitalize="none"
          style={[styles.searchInput, { color: p.ink }]}
          testID="home-search"
        />
      </View>
      <JoinSessionButton />

      <View style={[styles.filters, { borderBottomColor: p.hairline }]}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <HapticPressable
              key={f}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              haptic="select"
              onPress={() => setFilter(f)}
              style={[styles.filterTab, active && { borderBottomColor: p.primary }]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: p.muted },
                  active && { color: p.ink, fontWeight: '700' },
                ]}
              >
                {f}
              </Text>
            </HapticPressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  welcome: { flex: 1, gap: 2 },
  welcomeLabel: { fontSize: 12, fontWeight: '500' },
  name: { fontSize: 16, fontWeight: '700' },
  search: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: spacing.md },
  filters: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.xxl,
    // Divider runs edge to edge, past the screen padding (mockup).
    marginHorizontal: -spacing.xl,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  filterTab: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2.5,
    paddingBottom: spacing.sm + 2,
  },
  filterLabel: { fontSize: 14, fontWeight: '600' },
  list: { gap: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.xl },
});
