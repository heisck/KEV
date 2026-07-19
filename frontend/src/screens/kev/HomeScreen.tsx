import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CircleButton } from '@/components/kev/chrome';
import { BellIcon, SearchIcon } from '@/components/kev/icons';
import { Avatar } from '@/components/kev/people';
import { ExamCard } from '@/components/kev/ExamCard';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { EXAMS, type ExamStatus } from '@/data/exams';
import { useAuthStore } from '@/store/authStore';
import { colors, radii, spacing } from '@/theme';

const FILTERS = ['All', 'Upcoming', 'Ongoing', 'Past'] as const;
type Filter = (typeof FILTERS)[number];

/** Home — welcome header, session search, exam filters, exam cards (kev mockup screen 1). */
export function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { top } = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');

  const exams = EXAMS.filter(
    (e) =>
      (filter === 'All' || e.status === (filter as ExamStatus)) &&
      e.course.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
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
          <Text style={styles.welcomeLabel}>Welcome back</Text>
          <Text style={styles.name}>{user?.displayName ?? 'Invigilator'}</Text>
        </View>
        <CircleButton label="Notifications" onPress={() => router.push('/(tabs)/reminders')}>
          <BellIcon color={colors.ink} />
        </CircleButton>
      </View>

      <View style={styles.search}>
        <SearchIcon color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search sessions by class"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={styles.searchInput}
          testID="home-search"
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <HapticPressable
              key={f}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              haptic="select"
              onPress={() => setFilter(f)}
              style={[styles.filterTab, active && styles.filterTabActive]}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{f}</Text>
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
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  welcome: { flex: 1, gap: 2 },
  welcomeLabel: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  name: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  search: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { color: colors.ink, flex: 1, fontSize: 14, paddingVertical: spacing.md },
  filters: {
    borderBottomColor: colors.hairline,
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
  filterTabActive: { borderBottomColor: colors.primary },
  filterLabel: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  filterLabelActive: { color: colors.ink, fontWeight: '700' },
  list: { gap: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.xl },
});
