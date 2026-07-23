import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMarkReportRead, useMarkReportsRead, useReports } from '@/api/hooks';
import { BackIcon } from '@/components/kev/icons';
import { DoubleCheckIcon } from '@/components/notifications/DoubleCheckIcon';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportCreatePanel } from '@/components/reports/ReportCreatePanel';
import { ReportDetailDrawer } from '@/components/reports/ReportDetailDrawer';
import type { StudentReport } from '@/api/schemas';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { radii, spacing, usePalette } from '@/theme';

type StatusFilter = 'unread' | 'read';
const RECENT_MS = 7 * 24 * 60 * 60 * 1000;

export function ReportsScreen() {
  const router = useRouter();
  const { report: reportParam } = useLocalSearchParams<{ report?: string }>();
  const openedTarget = useRef<string | null>(null);
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const { data = [], isLoading } = useReports();
  const markRead = useMarkReportRead();
  const markVisibleRead = useMarkReportsRead();
  const [createMode, setCreateMode] = useState(false);
  const [recent, setRecent] = useState(true);
  const [status, setStatus] = useState<StatusFilter | null>(null);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState<StudentReport | null>(null);

  useEffect(() => {
    if (!reportParam || openedTarget.current === reportParam) return;
    const match = data.find((report) => String(report.id) === reportParam);
    if (!match) return;
    openedTarget.current = reportParam;
    setSelected(match);
    if (!match.read) markRead.mutate(match.id);
  }, [data, markRead, reportParam]);

  const visible = useMemo(
    () =>
      data.filter((report) => {
        if (recent && Date.now() - new Date(report.createdAt).getTime() > RECENT_MS) return false;
        if (status && (report.read ? 'read' : 'unread') !== status) return false;
        return true;
      }),
    [data, recent, status],
  );
  const unreadIds = visible.filter((report) => !report.read).map((report) => report.id);

  const chooseCreate = () => {
    setCreateMode(true);
    setRecent(false);
    setStatus(null);
  };
  const toggleRecent = () => {
    setCreateMode(false);
    setRecent((current) => (createMode ? true : !current));
  };
  const toggleStatus = (next: StatusFilter) => {
    setCreateMode(false);
    setStatus((current) => (current === next ? null : next));
  };

  const chip = (label: string, active: boolean, onPress: () => void, testID: string) => (
    <HapticPressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      key={label}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? p.primary : p.surfaceDim }]}
      testID={testID}
    >
      <Text
        numberOfLines={1}
        style={[styles.chipText, { color: active ? p.onPrimary : p.inkSoft }]}
      >
        {label}
      </Text>
    </HapticPressable>
  );

  return (
    <Pressable
      style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.sm }]}
      onPress={Keyboard.dismiss}
    >
      <View style={styles.header}>
        <HapticPressable
          accessibilityLabel="Back to profile"
          onPress={() => router.back()}
          style={[styles.icon, { backgroundColor: p.surfaceDim }]}
        >
          <BackIcon color={p.ink} />
        </HapticPressable>
        <Text style={[styles.title, { color: p.ink }]}>Reports</Text>
        {createMode && sending ? (
          <View style={[styles.icon, { backgroundColor: p.surfaceDim }]} testID="report-sending">
            <ActivityIndicator color={p.primary} />
          </View>
        ) : status === 'unread' ? (
          <HapticPressable
            accessibilityLabel="Mark filtered reports as read"
            disabled={unreadIds.length === 0}
            onPress={() => markVisibleRead.mutate(unreadIds)}
            style={[
              styles.icon,
              { backgroundColor: p.surfaceDim },
              unreadIds.length === 0 && styles.disabled,
            ]}
          >
            <DoubleCheckIcon color={unreadIds.length ? p.primary : p.muted} />
          </HapticPressable>
        ) : (
          <View style={styles.icon} />
        )}
      </View>
      <View style={styles.filters}>
        {chip('Create', createMode, chooseCreate, 'report-filter-create')}
        {chip('Recent', recent, toggleRecent, 'report-filter-recent')}
        {chip('Unread', status === 'unread', () => toggleStatus('unread'), 'report-filter-unread')}
        {chip('Read', status === 'read', () => toggleStatus('read'), 'report-filter-read')}
      </View>
      {createMode ? (
        <ReportCreatePanel onSendingChange={setSending} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <LoadingSkeleton variant="rows" />
          ) : visible.length ? (
            visible.map((report) => (
              <ReportCard
                key={report.id}
                item={report}
                palette={p}
                onPress={() => {
                  if (!report.read) markRead.mutate(report.id);
                  setSelected(report);
                }}
              />
            ))
          ) : (
            <Text style={[styles.empty, { color: p.muted }]}>No reports match these filters.</Text>
          )}
        </ScrollView>
      )}
      <ReportDetailDrawer report={selected} onClose={() => setSelected(null)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  icon: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  title: { fontSize: 18, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  filters: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.xl,
  },
  chip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flex: 1,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  body: { gap: spacing.md, paddingBottom: spacing.xxxl, paddingHorizontal: spacing.xl },
  empty: { paddingVertical: spacing.xxxl, textAlign: 'center' },
});
