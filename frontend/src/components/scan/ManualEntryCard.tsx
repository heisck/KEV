import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { AppButton, Card } from '@/components/ui';
import { radii, spacing, usePalette } from '@/theme';

type ManualEntryCardProps = { onSubmit: (indexNumber: string) => void };

/** Manual mode: index-number input on a white card. */
export function ManualEntryCard({ onSubmit }: ManualEntryCardProps) {
  const p = usePalette();
  const [value, setValue] = useState('');
  const trimmed = value.trim();

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: p.ink }]}>Enter index number</Text>
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="numbers-and-punctuation"
        onChangeText={setValue}
        placeholder="e.g. 1024"
        placeholderTextColor={p.muted}
        style={[
          styles.input,
          { backgroundColor: p.surfaceDim, borderColor: p.hairline, color: p.ink },
        ]}
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
  title: { fontSize: 16, fontWeight: '700' },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    fontSize: 18,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
  },
});
