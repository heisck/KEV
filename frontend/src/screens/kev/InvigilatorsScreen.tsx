import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLecturers } from '@/api/hooks';
import type { UserDto } from '@/api/schemas';
import { ScreenTopBar } from '@/components/kev/chrome';
import { ChevronRightIcon, SearchIcon, StepsIcon } from '@/components/kev/icons';
import { Avatar, personForId } from '@/components/kev/people';
import { AppButton } from '@/components/ui/AppButton';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';

/** Explore invigilators — searchable list; tap a row for join details. */
export function InvigilatorsScreen() {
  const router = useRouter();
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<UserDto | null>(null);

  const { data: invigilatorsList } = useLecturers();
  const results = (invigilatorsList ?? []).filter((i) =>
    (i.displayName || i.email).toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Invigilators" onBack={() => router.back()} />

      <View style={[styles.search, { backgroundColor: p.surfaceDim }]}>
        <SearchIcon color={p.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search invigilators"
          placeholderTextColor={p.muted}
          autoCapitalize="none"
          style={[styles.searchInput, { color: p.ink }]}
          testID="invigilator-search"
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {results.map((i) => (
          <HapticPressable
            key={i.id}
            accessibilityRole="button"
            onPress={() => setSelected(i)}
            style={[styles.row, { backgroundColor: p.surfaceDim }]}
            testID={`invigilator-${i.id}`}
          >
            <Avatar person={personForId(i.id)} size={44} verified />
            <View style={styles.rowText}>
              <Text style={[styles.rowName, { color: p.ink }]}>{i.displayName || i.email}</Text>
              <Text style={[styles.rowSub, { color: p.muted }]}>{i.role} · Active Staff</Text>
            </View>
            <ChevronRightIcon color={p.muted} size={15} />
          </HapticPressable>
        ))}
        {results.length === 0 ? (
          <Text style={[styles.empty, { color: p.muted }]}>No invigilators match.</Text>
        ) : null}
      </ScrollView>

      <BottomDrawer
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.displayName ?? selected?.email ?? ''}
        testID="invigilator-details"
      >
        {selected ? (
          <View style={styles.details}>
            <Avatar person={personForId(selected.id)} size={72} verified />
            <View style={styles.detailRow}>
              <StepsIcon color={p.inkSoft} size={13} />
              <Text style={[styles.detailText, { color: p.ink }]}>{selected.role}</Text>
            </View>
            <Text style={[styles.detailSub, { color: p.muted }]}>{selected.email}</Text>
            <AppButton
              label="Message in chat"
              onPress={() => {
                const id = selected.id;
                setSelected(null);
                router.push({ pathname: '/chat/[id]', params: { id } });
              }}
              style={styles.detailCta}
            />
          </View>
        ) : null}
      </BottomDrawer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  search: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: spacing.md },
  list: { gap: spacing.md, paddingBottom: spacing.xxxl, paddingTop: spacing.lg },
  row: {
    alignItems: 'center',
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, fontWeight: '500' },
  empty: { fontSize: 13, paddingTop: spacing.xl, textAlign: 'center' },
  details: { alignItems: 'center', gap: spacing.sm },
  detailRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  detailText: { fontSize: 14, fontWeight: '600' },
  detailSub: { fontSize: 13, fontWeight: '500' },
  detailCta: { alignSelf: 'stretch', marginTop: spacing.sm },
});
