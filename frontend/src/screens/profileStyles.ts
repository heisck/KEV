import { StyleSheet } from 'react-native';

import { radii, spacing } from '@/theme';

const AVATAR = 92;

export const profileStyles = StyleSheet.create({
  screen: { flex: 1 },
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
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    flex: 1,
    marginTop: -spacing.md,
  },
  sheetBody: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.xl },
  identity: { alignItems: 'center', paddingBottom: spacing.md, paddingTop: spacing.xl },
  avatarRing: { borderRadius: (AVATAR + 12) / 2, borderWidth: 3, padding: 3 },
  avatar: { borderRadius: AVATAR / 2, height: AVATAR, width: AVATAR },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 34, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', marginTop: spacing.md },
  email: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  version: { fontSize: 12, fontWeight: '500', paddingTop: spacing.xl, textAlign: 'center' },
});
