import { StyleSheet } from 'react-native';

import type { Palette } from '@/theme';
import { radii, spacing, typography } from '@/theme';

export const makeStyles = (p: Palette) =>
  StyleSheet.create({
    screen: { backgroundColor: p.surfaceDim, flex: 1 },
    content: { flexGrow: 1, gap: spacing.lg, padding: spacing.xl },
    card: { alignItems: 'center', gap: spacing.md },
    statusLabel: { color: p.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
    photoWrap: { position: 'relative' },
    photo: {
      borderColor: p.surface,
      borderRadius: radii.xl,
      borderWidth: 4,
      height: 148,
      width: 148,
    },
    badge: { bottom: -6, position: 'absolute', right: -6 },
    name: {
      color: p.ink,
      fontFamily: typography.display,
      fontSize: 26,
      textAlign: 'center',
    },
    meta: { color: p.inkSoft, fontSize: 14, textAlign: 'center' },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      justifyContent: 'center',
    },
    actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
    errorText: { color: p.error, fontSize: 13, textAlign: 'center' },
    skeleton: {
      backgroundColor: p.primary08,
      borderRadius: radii.lg,
      height: 220,
    },
    celebrate: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xxxl },
    celebrateTitle: {
      color: p.ink,
      fontFamily: typography.display,
      fontSize: 28,
      textAlign: 'center',
    },
  });
