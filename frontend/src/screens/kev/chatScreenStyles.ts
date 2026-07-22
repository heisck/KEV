import { StyleSheet } from 'react-native';

import { colors, radii, spacing } from '@/theme';

export const chatScreenStyles = StyleSheet.create({
  screen: { backgroundColor: colors.white, flex: 1 },
  threadHeader: {
    alignItems: 'center',
    borderBottomColor: colors.hairline,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backBtn: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  threadHeadText: { flex: 1, gap: 1 },
  threadName: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  threadSub: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  messages: { flexGrow: 1, gap: spacing.sm, padding: spacing.lg },
  threadEmpty: {
    color: colors.muted,
    fontSize: 13,
    marginTop: spacing.xxxl,
    textAlign: 'center',
  },
  bubble: {
    borderRadius: radii.md,
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceDim,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: colors.ink, fontSize: 15, fontWeight: '500', lineHeight: 20 },
  bubbleTextMine: { color: colors.white },
  bubbleTime: {
    alignSelf: 'flex-end',
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.75)' },
  composer: {
    alignItems: 'center',
    borderTopColor: colors.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  send: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
