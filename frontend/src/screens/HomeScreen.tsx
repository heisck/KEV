import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessions } from '@/api/hooks';
import { DoodleScan } from '@/components/doodles/DoodleScan';
import { CalendarStrip, CtaCard, HeroCard, ScreenHeader, StatTile } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { spacing } from '@/theme';

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Dashboard: greeting header, live-session hero, quick scan CTA, calendar, stat grid. */
export function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: sessions } = useSessions();
  const { top } = useSafeAreaInsets();

  const { active, markedDates, stats } = useMemo(() => {
    const all = sessions ?? [];
    const activeSessions = all.filter((s) => s.status === 'ACTIVE');
    return {
      active: activeSessions[0],
      markedDates: all.map((s) => new Date(s.startedAt)),
      stats: {
        checkedIn: activeSessions.reduce((sum, s) => sum + s.checkedInCount, 0),
        today: all.filter((s) => isToday(s.startedAt)).length,
        active: activeSessions.length,
        invigilators: activeSessions.reduce((sum, s) => sum + s.invigilatorCount, 0),
      },
    };
  }, [sessions]);

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        greeting={greetingForNow()}
        name={user?.displayName ?? user?.email ?? 'Invigilator'}
        avatarUrl={user?.pictureUrl ?? undefined}
        onPressAvatar={() => router.push('/(tabs)/profile')}
      />

      {active ? (
        <HeroCard
          headline={['Session live.', active.sessionCode]}
          caption={[active.building, active.room].filter(Boolean).join(' · ')}
          onPress={() =>
            router.push({ pathname: '/(tabs)/sessions/[id]', params: { id: String(active.id) } })
          }
          testID="home-hero-active"
        />
      ) : (
        <HeroCard
          headline={['Every student.', 'Verified.']}
          caption="Create a session to start checking students in."
          illustration={<DoodleScan size={110} />}
          onPress={() => router.push('/room-setup')}
          testID="home-hero-empty"
        />
      )}

      <CtaCard
        title="Quick scan"
        subtitle="NFC · QR · Manual"
        onPress={() => router.push('/(tabs)/scan')}
      />

      <CalendarStrip markedDates={markedDates} />

      <View style={styles.grid}>
        <View style={styles.gridRow}>
          <StatTile label="Checked in" count={stats.checkedIn} tone="primary" />
          <StatTile label="Sessions today" count={stats.today} tone="mint" />
        </View>
        <View style={styles.gridRow}>
          <StatTile label="Active sessions" count={stats.active} tone="neutral" />
          <StatTile label="Invigilators" count={stats.invigilators} tone="warn" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: 120, paddingHorizontal: spacing.xl },
  grid: { gap: spacing.md },
  gridRow: { flexDirection: 'row', gap: spacing.md },
});
