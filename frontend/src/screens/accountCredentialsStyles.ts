import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme';

export const ACCOUNT_AVATAR = 92;

export const accountCredentialsStyles = StyleSheet.create({
  action: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.xxxl },
  avatar: {
    borderRadius: ACCOUNT_AVATAR / 2,
    height: ACCOUNT_AVATAR,
    width: ACCOUNT_AVATAR,
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 34, fontWeight: '800' },
  avatarRing: { borderRadius: (ACCOUNT_AVATAR + 12) / 2, borderWidth: 3, padding: 3 },
  band: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  bandBtn: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bandTitle: { fontSize: 18, fontWeight: '700' },
  editBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 2,
    bottom: 2,
    height: 26,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 26,
  },
  field: { gap: spacing.xs, paddingTop: spacing.lg },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  identity: { alignItems: 'center', paddingBottom: spacing.lg, paddingTop: spacing.xl },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: spacing.sm,
  },
  screen: { flex: 1 },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    flex: 1,
    marginTop: -spacing.md,
  },
  sheetBody: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.xl },
});
