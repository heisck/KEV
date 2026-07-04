import { StyleSheet } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@/theme';

export const loginStyles = StyleSheet.create({
  screen: { backgroundColor: colors.surfaceDim, flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    gap: spacing.lg,
    padding: spacing.xxl,
    ...shadows.card,
  },
  heading: {
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 32,
    lineHeight: 38,
  },
  headingAccent: { color: colors.primary },
  subheading: { color: colors.muted, fontSize: 14 },
  field: { gap: spacing.xs },
  label: { color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceDim,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
  inputError: { borderColor: colors.error },
  fieldError: { color: colors.error, fontSize: 12 },
  problem: {
    backgroundColor: colors.errorSoft,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  problemText: { color: colors.error, fontSize: 13, fontWeight: '600' },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  switchText: { color: colors.muted, fontSize: 13 },
  switchLink: { color: colors.primary, fontSize: 13, fontWeight: '700' },
});
