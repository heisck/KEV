import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { AppButton, Card } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

type ManualEntryCardProps = { onSubmit: (indexNumber: string) => void };

/** Manual mode: index-number input on a white card. */
export function ManualEntryCard({ onSubmit }: ManualEntryCardProps) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Enter index number</Text>
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
        onChangeText={setValue}
        placeholder="e.g. 1024"
        placeholderTextColor={colors.muted}
        style={styles.input}
        testID="manual-index-input"
        value={value}
      />
      <AppButton
        label="Look up student"
        disabled={trimmed.length === 0}
        onPress={() => onSubmit(trimmed)}
        testID="manual-submit"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  title: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  input: {
    backgroundColor: colors.surfaceDim,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
});
