import { StyleSheet, Text, View } from 'react-native';

import { spacing, usePalette } from '@/theme';

type EmptyStateProps = {
  title: string;
  message?: string;
  /** Doodle illustration slot. */
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  testID?: string;
};

export function EmptyState({ title, message, illustration, action, testID }: EmptyStateProps) {
  const p = usePalette();
  return (
    <View style={styles.container} testID={testID}>
      {illustration}
      <Text style={[styles.title, { color: p.ink }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: p.muted }]}>{message}</Text> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
