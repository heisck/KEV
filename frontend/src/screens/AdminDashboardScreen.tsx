import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAdminsList, useAdminSessions, useLecturersList } from '@/api/hooks';
import type { SessionDto, UserDto } from '@/api/schemas';
import { CircleButton } from '@/components/kev/chrome';
import { BellIcon, ExamsTabIcon, ProfileTabIcon, SearchIcon } from '@/components/kev/icons';
import { Avatar, personForId } from '@/components/kev/people';
import { AppButton, BottomDrawer, Card, EmptyState, ListRow, StatusPill } from '@/components/ui';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { AssignSheet, ReportSheet } from '@/screens/AdminSheets';
import { useAuthStore } from '@/store/authStore';
import { radii, spacing, usePalette } from '@/theme';

type AdminCategory = 'sessions' | 'lecturers' | 'admins';
type SessionFilter = 'All' | 'Active' | 'Completed' | 'Upcoming';

const SESSION_FILTERS: SessionFilter[] = ['All', 'Active', 'Completed', 'Upcoming'];

type SheetState = { kind: 'report' | 'assign'; sessionId: number } | null;

export function AdminDashboardScreen() {
  const router = useRouter();
  const p = usePalette();
  const user = useAuthStore((s) => s.user);
  const { top } = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState<AdminCategory>('sessions');
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('All');
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<SheetState>(null);

  const { data: sessions, isLoading: loadingSessions } = useAdminSessions();
  const { data: lecturers, isLoading: loadingLecturers } = useLecturersList();
  const { data: admins, isLoading: loadingAdmins } = useAdminsList();

  const isLoading = loadingSessions || loadingLecturers || loadingAdmins;

  // Counts for category badges
  const activeSessionsCount = useMemo(
    () => sessions?.filter((s) => s.status === 'ACTIVE').length ?? 0,
    [sessions],
  );
  const lecturersCount = lecturers?.length ?? 0;
  const adminsCount = admins?.length ?? 0;

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      // Status filter
      if (sessionFilter === 'Active' && s.status !== 'ACTIVE') return false;
      if (sessionFilter === 'Completed' && s.status !== 'ENDED' && s.status !== 'COMPLETED')
        return false;
      if (sessionFilter === 'Upcoming' && s.status !== 'UPCOMING') return false;

      // Query filter
      if (!q) return true;
      const codeMatch = s.sessionCode.toLowerCase().includes(q);
      const buildingMatch = (s.building ?? '').toLowerCase().includes(q);
      const roomMatch = (s.room ?? '').toLowerCase().includes(q);
      const courseMatch = s.courseCodes.some((c) => c.toLowerCase().includes(q));
      return codeMatch || buildingMatch || roomMatch || courseMatch;
    });
  }, [sessions, sessionFilter, query]);

  // Filtered Lecturers
  const filteredLecturers = useMemo(() => {
    if (!lecturers) return [];
    const q = query.trim().toLowerCase();
    if (!q) return lecturers;
    return lecturers.filter((l) => {
      const nameMatch = (l.displayName ?? '').toLowerCase().includes(q);
      const emailMatch = l.email.toLowerCase().includes(q);
      const phoneMatch = (l.phone ?? '').toLowerCase().includes(q);
      const idMatch = (l.lecturerId ?? '').toLowerCase().includes(q);
      return nameMatch || emailMatch || phoneMatch || idMatch;
    });
  }, [lecturers, query]);

  // Filtered Admins
  const filteredAdmins = useMemo(() => {
    if (!admins) return [];
    const q = query.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a) => {
      const nameMatch = (a.displayName ?? '').toLowerCase().includes(q);
      const emailMatch = a.email.toLowerCase().includes(q);
      const phoneMatch = (a.phone ?? '').toLowerCase().includes(q);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [admins, query]);

  const searchPlaceholder =
    activeCategory === 'sessions'
      ? 'Search sessions by code, building, or course...'
      : activeCategory === 'lecturers'
        ? 'Search lecturers by name, email, or phone...'
        : 'Search admins by name, email, or phone...';

  const categories: {
    id: AdminCategory;
    label: string;
    count: number;
    icon: (color: string) => React.ReactNode;
  }[] = [
    {
      id: 'sessions',
      label: 'Sessions',
      count: activeSessionsCount,
      icon: (color) => <ExamsTabIcon color={color} size={20} />,
    },
    {
      id: 'lecturers',
      label: 'Lecturers',
      count: lecturersCount,
      icon: (color) => <ProfileTabIcon color={color} size={20} />,
    },
    {
      id: 'admins',
      label: 'Admins',
      count: adminsCount,
      icon: (color) => <ProfileTabIcon color={color} size={20} />,
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      {/* Header — matches Lecturer Home */}
      <View style={styles.header}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          haptic="select"
          onPress={() => router.push('/(admin-tabs)/profile')}
        >
          <Avatar person={personForId(user?.id)} size={44} />
        </HapticPressable>
        <View style={styles.welcome}>
          <Text style={[styles.welcomeLabel, { color: p.muted }]}>Admin Console</Text>
          <Text style={[styles.name, { color: p.ink }]}>{user?.displayName ?? 'Admin'}</Text>
        </View>
        <CircleButton label="Notifications" onPress={() => router.push('/(admin-tabs)/reminders')}>
          <BellIcon color={p.ink} size={20} />
        </CircleButton>
      </View>

      {/* Search Input */}
      <View style={[styles.search, { backgroundColor: p.surfaceDim }]}>
        <SearchIcon color={p.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor={p.muted}
          autoCapitalize="none"
          style={[styles.searchInput, { color: p.ink }]}
          testID="admin-search"
        />
      </View>

      {/* Animated Accordion Category Divs */}
      <View style={styles.categoryRow}>
        {categories.map((cat) => {
          const isExpanded = activeCategory === cat.id;
          const activeColor = p.primary;
          const inactiveColor = p.muted;

          return (
            <Animated.View
              key={cat.id}
              layout={LinearTransition.duration(180)}
              style={[
                styles.categoryPill,
                isExpanded ? styles.categoryPillExpanded : styles.categoryPillCollapsed,
                {
                  backgroundColor: isExpanded ? p.primary12 : p.surfaceDim,
                  borderColor: isExpanded ? p.primary : 'transparent',
                },
              ]}
            >
              <HapticPressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isExpanded }}
                haptic="select"
                onPress={() => {
                  setActiveCategory(cat.id);
                  setQuery('');
                }}
                style={styles.categoryPressable}
              >
                {cat.icon(isExpanded ? activeColor : inactiveColor)}
                {isExpanded ? (
                  <>
                    <Text style={[styles.categoryLabel, { color: p.ink }]}>{cat.label}</Text>
                    <View style={[styles.countBadge, { backgroundColor: p.primary }]}>
                      <Text style={[styles.countBadgeText, { color: p.onPrimary }]}>
                        {cat.count}
                      </Text>
                    </View>
                  </>
                ) : null}
              </HapticPressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Sessions Sub-Filters (only visible when Sessions category is expanded) */}
      {activeCategory === 'sessions' ? (
        <View style={[styles.filters, { borderBottomColor: p.hairline }]}>
          {SESSION_FILTERS.map((f) => {
            const active = f === sessionFilter;
            return (
              <HapticPressable
                key={f}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                haptic="select"
                onPress={() => setSessionFilter(f)}
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
      ) : null}

      {/* Main List Content */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingSkeleton testID="admin-dash-skeleton" variant="cards" />
        ) : (
          <>
            {/* Active Category: Sessions */}
            {activeCategory === 'sessions' ? (
              filteredSessions.length === 0 ? (
                <EmptyState
                  title="No sessions found"
                  message={
                    query.trim() ? `No sessions match "${query}".` : 'No sessions recorded yet.'
                  }
                />
              ) : (
                filteredSessions.map((session: SessionDto) => (
                  <Pressable
                    key={session.id}
                    accessibilityRole="button"
                    onPress={() => setSheet({ kind: 'report', sessionId: session.id })}
                  >
                    <Card style={styles.sessionCard}>
                      <View style={styles.cardTop}>
                        <Text style={[styles.cardCode, { color: p.ink }]}>
                          {session.sessionCode}
                        </Text>
                        <StatusPill
                          label={session.status === 'ACTIVE' ? 'Active' : session.status}
                          tone={session.status === 'ACTIVE' ? 'success' : 'neutral'}
                        />
                      </View>
                      <Text style={[styles.cardMeta, { color: p.muted }]}>
                        {session.building} {session.room ? `· Room ${session.room}` : ''}
                      </Text>
                      <Text style={[styles.cardMeta, { color: p.muted }]}>
                        {session.checkedInCount} checked in · {session.invigilatorCount}{' '}
                        invigilators
                      </Text>
                      <AppButton
                        label="Assign Invigilators"
                        variant="ghost"
                        onPress={() => setSheet({ kind: 'assign', sessionId: session.id })}
                      />
                    </Card>
                  </Pressable>
                ))
              )
            ) : null}

            {/* Active Category: Lecturers */}
            {activeCategory === 'lecturers' ? (
              filteredLecturers.length === 0 ? (
                <EmptyState
                  title="No lecturers found"
                  message={
                    query.trim()
                      ? `No lecturers match "${query}".`
                      : 'No lecturers onboarded yet. Use the Add tab to onboard.'
                  }
                />
              ) : (
                filteredLecturers.map((l: UserDto) => (
                  <ListRow
                    key={l.id}
                    title={l.displayName ?? l.email}
                    subtitle={`${l.lecturerId ?? 'ID N/A'} · ${l.email}${
                      l.phone ? ' · ' + l.phone : ''
                    }`}
                    avatarUrl={l.pictureUrl ?? undefined}
                    trailing={
                      <StatusPill
                        label={l.active ? 'Active' : 'Disabled'}
                        tone={l.active ? 'success' : 'error'}
                      />
                    }
                  />
                ))
              )
            ) : null}

            {/* Active Category: Admins */}
            {activeCategory === 'admins' ? (
              filteredAdmins.length === 0 ? (
                <EmptyState
                  title="No admins found"
                  message={
                    query.trim()
                      ? `No administrators match "${query}".`
                      : 'No administrators found.'
                  }
                />
              ) : (
                filteredAdmins.map((a: UserDto) => {
                  const dateLabel = a.createdAt
                    ? `Added ${new Date(a.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : 'Added recently';
                  return (
                    <ListRow
                      key={a.id}
                      title={a.displayName ?? a.email}
                      subtitle={`${a.email}${a.phone ? ' · ' + a.phone : ''}`}
                      avatarUrl={a.pictureUrl ?? undefined}
                      trailing={<StatusPill label={dateLabel} tone="neutral" />}
                    />
                  );
                })
              )
            ) : null}
          </>
        )}
      </ScrollView>

      {/* Report & Invigilator Assign Bottom Drawers */}
      <BottomDrawer
        visible={sheet !== null}
        onClose={() => setSheet(null)}
        title={
          sheet?.kind === 'assign'
            ? 'Assign Invigilators'
            : sheet?.kind === 'report'
              ? 'Session Attendance Report'
              : ''
        }
      >
        {sheet?.kind === 'report' ? <ReportSheet sessionId={sheet.sessionId} /> : null}
        {sheet?.kind === 'assign' ? (
          <AssignSheet sessionId={sheet.sessionId} onClose={() => setSheet(null)} />
        ) : null}
      </BottomDrawer>
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

  // Accordion Category Divs
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  categoryPill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryPillExpanded: {
    flex: 1,
  },
  categoryPillCollapsed: {
    width: 44,
  },
  categoryPressable: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 'auto',
  },
  countBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Sessions Status Filters
  filters: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.xl,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  filterTab: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2.5,
    paddingBottom: spacing.sm + 2,
  },
  filterLabel: { fontSize: 13, fontWeight: '600' },

  list: { gap: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.md },

  sessionCard: { gap: spacing.sm },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  cardCode: { fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  cardMeta: { fontSize: 13 },
});
