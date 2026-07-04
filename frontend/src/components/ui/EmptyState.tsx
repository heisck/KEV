import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type EmptyStateProps = {
  title: string;
  message?: string;
  /** Doodle illustration slot. */
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  testID?: string;
};

export function EmptyState({ title, message, illustration, action, testID }: EmptyStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      {illustration}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
    color: colors.ink,
    fontFamily: typography.display,
    fontSize: 22,
    textAlign: 'center',
  },
  message: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
