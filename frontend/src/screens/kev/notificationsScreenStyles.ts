import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme';

export const notificationsScreenStyles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  skeleton: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  filterScroll: { flexGrow: 0, height: 48 },
  filters: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  pill: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  pillText: { fontSize: 13, fontWeight: '700' },
  list: { paddingBottom: spacing.xxxl },
  listBorder: { borderTopWidth: StyleSheet.hairlineWidth },
  empty: {
    fontSize: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    textAlign: 'center',
  },
});
