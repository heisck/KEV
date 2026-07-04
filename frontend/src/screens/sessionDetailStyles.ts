import { StyleSheet } from 'react-native';

import { colors, spacing, typography } from '@/theme';

export const sessionDetailStyles = StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: 120, paddingHorizontal: spacing.xl },
  headerCard: { gap: spacing.lg },
  headerTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  code: { color: colors.ink, fontFamily: typography.display, fontSize: 30 },
  place: { color: colors.inkSoft, fontSize: 14 },
  ringRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xl },
  counts: { flex: 1, gap: spacing.xs },
  countLine: { color: colors.inkSoft, fontSize: 14 },
  countStrong: { color: colors.ink, fontWeight: '800' },
  actions: { gap: spacing.sm },
  errorText: { color: colors.error, fontSize: 13 },
  sectionTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  rowTrailing: { alignItems: 'flex-end', gap: spacing.xs },
  invigilatorCard: { gap: spacing.md },
  invigilatorNames: { color: colors.inkSoft, fontSize: 13, lineHeight: 19 },
  drawerBody: { gap: spacing.lg },
  drawerText: { color: colors.inkSoft, fontSize: 14, lineHeight: 20 },
  loading: { padding: spacing.xxxl },
});
