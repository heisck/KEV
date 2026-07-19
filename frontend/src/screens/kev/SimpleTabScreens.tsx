import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExamCard } from '@/components/kev/ExamCard';
import { RemindersTabIcon } from '@/components/kev/icons';
import { AppButton } from '@/components/ui/AppButton';
import { EXAMS } from '@/data/exams';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { colors, radii, spacing } from '@/theme';

function TabScreen({ title, children }: { title: string; children: ReactNode }) {
  const { top } = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

function Empty({
  icon,
  headline,
  sub,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  headline: string;
  sub: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyCircle}>{icon}</View>
      <Text style={styles.emptyHeadline}>{headline}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
      <View style={styles.emptyCtaWrap}>
        <AppButton label={actionLabel} onPress={onAction} style={styles.emptyCta} />
      </View>
    </View>
  );
}

/** Exams tab — list for now; richer exam detail UI comes later. */
export function ExamsScreen() {
  return (
    <TabScreen title="My exams">
      <Text style={styles.hint}>
        More exam detail views will land here later. For now, open a card to continue.
      </Text>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {EXAMS.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </ScrollView>
    </TabScreen>
  );
}

export function RemindersScreen() {
  const router = useRouter();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const notifications = useNotificationsStore((s) => s.items);
  const favorites = EXAMS.filter((e) => favoriteIds.has(e.id));

  const hasContent = favorites.length > 0 || notifications.length > 0;

  if (!hasContent) {
    return (
      <TabScreen title="Reminders">
        <Empty
          icon={<RemindersTabIcon color={colors.primary} size={28} />}
          headline="No reminders yet"
          sub="Session alerts and favorites will show up here."
          actionLabel="Browse exams"
          onAction={() => router.push('/(tabs)/exams')}
        />
      </TabScreen>
    );
  }

  return (
    <TabScreen title="Reminders">
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alerts</Text>
            {notifications.map((n) => (
              <View key={n.id} style={[styles.alert, !n.read && styles.alertUnread]}>
                <Text style={styles.alertTitle}>{n.title}</Text>
                <Text style={styles.alertBody}>{n.body}</Text>
                <Text style={styles.alertAt}>{n.at}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {favorites.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            {favorites.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800', paddingVertical: spacing.md },
  hint: { color: colors.muted, fontSize: 13, fontWeight: '500', marginBottom: spacing.sm },
  list: { gap: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  empty: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
    paddingBottom: 80,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  emptyCircle: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 72,
  },
  emptyHeadline: { color: colors.ink, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySub: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyCtaWrap: {
    alignItems: 'center',
    alignSelf: 'stretch',
    width: '100%',
  },
  emptyCta: {
    alignSelf: 'center',
    minWidth: 220,
    width: '80%',
  },
  section: { gap: spacing.md },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  alert: {
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.md,
    gap: 4,
    padding: spacing.md,
  },
  alertUnread: {
    borderColor: colors.primary12,
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
  },
  alertTitle: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  alertBody: { color: colors.inkSoft, fontSize: 13, fontWeight: '500' },
  alertAt: { color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: 2 },
});
