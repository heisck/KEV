import { StyleSheet, Text, TextInput, View } from 'react-native';

import { SearchIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import type { StudentMethodFilter } from '@/data/exams';
import { radii, spacing, usePalette } from '@/theme';

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  method: StudentMethodFilter;
  onMethodChange: (method: StudentMethodFilter) => void;
  alphabetical: boolean;
  onAlphabeticalChange: (alphabetical: boolean) => void;
};

const METHODS = ['NFC', 'MANUAL', 'FACE'] as const;

export function StudentRosterControls({
  query,
  onQueryChange,
  method,
  onMethodChange,
  alphabetical,
  onAlphabeticalChange,
}: Props) {
  const p = usePalette();
  return (
    <View style={styles.container}>
      <View style={[styles.search, { backgroundColor: p.surfaceDim }]}>
        <SearchIcon color={p.muted} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search by name or index number"
          placeholderTextColor={p.muted}
          autoCapitalize="none"
          style={[styles.input, { color: p.ink }]}
          testID="session-student-search"
        />
      </View>
      <View style={styles.filters}>
        {METHODS.map((item) => {
          const active = method === item;
          return (
            <FilterChip
              key={item}
              label={item === 'MANUAL' ? 'Manual' : item}
              active={active}
              onPress={() => onMethodChange(active ? null : item)}
            />
          );
        })}
        <FilterChip
          label="A-Z"
          active={alphabetical}
          onPress={() => onAlphabeticalChange(!alphabetical)}
        />
      </View>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const p = usePalette();
  return (
    <HapticPressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? p.primary : p.surfaceDim,
          borderColor: active ? p.primary : p.hairline,
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.chipText, { color: active ? p.onPrimary : p.inkSoft }]}
      >
        {label}
      </Text>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  search: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: spacing.md },
  filters: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
});
