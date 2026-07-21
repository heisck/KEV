import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import type { StudentReport } from '@/api/schemas';
import { FormattedReportText } from '@/components/reports/FormattedReportText';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, type Palette } from '@/theme';

export function ReportCard({
  item,
  palette: p,
  onPress,
}: {
  item: StudentReport;
  palette: Palette;
  onPress: () => void;
}) {
  const title = item.student?.fullName ?? item.sessionTitle;
  const meta = item.student
    ? `${item.student.indexNumber} • ${item.sessionTitle}`
    : `${item.sessionCode} • General report`;
  return (
    <HapticPressable
      accessibilityRole="button"
      haptic="select"
      onPress={onPress}
      style={[styles.card, { backgroundColor: p.surfaceDim }]}
    >
      {item.student ? (
        <Image source={{ uri: item.student.photoUrl }} style={styles.avatar} contentFit="cover" />
      ) : null}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={[styles.name, { color: p.ink }]}>
            {title}
          </Text>
          {!item.read ? (
            <View
              style={[styles.unread, { backgroundColor: p.primary }]}
              testID={`report-unread-${item.id}`}
            />
          ) : null}
        </View>
        <Text style={[styles.meta, { color: p.muted }]}>{meta}</Text>
        <FormattedReportText value={item.message} style={[styles.message, { color: p.inkSoft }]} />
        <Text style={[styles.meta, { color: p.muted }]}>
          By {item.authorName} • {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  avatar: { borderRadius: radii.pill, height: 48, width: 48 },
  content: { flex: 1, gap: 4 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  name: { flex: 1, fontSize: 15, fontWeight: '800' },
  meta: { fontSize: 11, fontWeight: '500' },
  message: { fontSize: 13, lineHeight: 18 },
  unread: { borderRadius: radii.pill, height: 8, width: 8 },
});
