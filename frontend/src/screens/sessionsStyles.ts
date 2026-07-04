import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

export const sessionsStyles = StyleSheet.create({
  content: { gap: spacing.md, paddingBottom: 120, paddingHorizontal: spacing.xl },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { color: colors.ink, fontFamily: typography.display, fontSize: 28 },
  joinLink: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  card: { gap: spacing.md },
  cardTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  codePill: {
    backgroundColor: colors.primary12,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  codeText: { color: colors.primaryDeep, fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  place: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  cardBottom: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  checkedIn: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  drawerBody: { gap: spacing.lg },
  drawerInput: {
    backgroundColor: colors.surfaceDim,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 18,
    letterSpacing: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    textAlign: 'center',
  },
  drawerError: { color: colors.error, fontSize: 13, textAlign: 'center' },
  newSession: { marginTop: spacing.sm },
});
