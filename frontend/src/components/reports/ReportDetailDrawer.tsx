import { StyleSheet, Text, View } from 'react-native';

import type { StudentReport } from '@/api/schemas';
import { FormattedReportText } from '@/components/reports/FormattedReportText';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { spacing, usePalette } from '@/theme';

export function ReportDetailDrawer({
  report,
  onClose,
}: {
  report: StudentReport | null;
  onClose: () => void;
}) {
  const p = usePalette();
  return (
    <BottomDrawer
      onClose={onClose}
      testID="report-detail-drawer"
      title={report?.student?.fullName ?? report?.sessionTitle ?? 'Report'}
      visible={Boolean(report)}
    >
      {report ? (
        <View style={styles.content}>
          <Text style={[styles.meta, { color: p.muted }]}>
            {report.sessionCode} · {new Date(report.createdAt).toLocaleString()}
          </Text>
          <FormattedReportText style={[styles.message, { color: p.ink }]} value={report.message} />
          <Text style={[styles.author, { color: p.inkSoft }]}>
            Reported by {report.authorName} ({report.authorEmail})
          </Text>
          {report.student ? (
            <Text style={[styles.meta, { color: p.muted }]}>
              {report.student.indexNumber} · {report.student.programme} · Level{' '}
              {report.student.level}
            </Text>
          ) : null}
        </View>
      ) : null}
    </BottomDrawer>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: spacing.lg },
  meta: { fontSize: 12, fontWeight: '500' },
  message: { fontSize: 16, lineHeight: 24 },
  author: { fontSize: 13, fontWeight: '600' },
});
