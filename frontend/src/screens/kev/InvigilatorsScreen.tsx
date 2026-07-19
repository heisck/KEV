import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInvigilators } from '@/api/hooks';
import type { UserDto } from '@/api/schemas';
import { ScreenTopBar } from '@/components/kev/chrome';
import { ChevronRightIcon, SearchIcon, StepsIcon } from '@/components/kev/icons';
import { Avatar } from '@/components/kev/people';
import { AppButton } from '@/components/ui/AppButton';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { colors, radii, spacing } from '@/theme';

/** Explore invigilators — searchable list; tap a row for join details. */
export function InvigilatorsScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<UserDto | null>(null);

  const { data: invigilatorsList } = useInvigilators();
  const results = (invigilatorsList ?? []).filter((i) =>
    (i.displayName || i.email).toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Invigilators" onBack={() => router.back()} />

      <View style={styles.search}>
        <SearchIcon color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search invigilators"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          style={styles.searchInput}
          testID="invigilator-search"
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {results.map((i) => (
          <HapticPressable
            key={i.id}
            accessibilityRole="button"
            onPress={() => setSelected(i)}
            style={styles.row}
            testID={`invigilator-${i.id}`}
          >
            <Avatar person="freja" size={44} verified />
            <View style={styles.rowText}>
              <Text style={styles.rowName}>{i.displayName || i.email}</Text>
              <Text style={styles.rowSub}>{i.role} · Active Staff</Text>
            </View>
            <ChevronRightIcon color={colors.muted} size={15} />
          </HapticPressable>
        ))}
        {results.length === 0 ? <Text style={styles.empty}>No invigilators match.</Text> : null}
      </ScrollView>

      <BottomDrawer
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.displayName ?? selected?.email ?? ''}
        testID="invigilator-details"
      >
        {selected ? (
          <View style={styles.details}>
            <Avatar person="freja" size={72} verified />
            <View style={styles.detailRow}>
              <StepsIcon color={colors.inkSoft} size={13} />
              <Text style={styles.detailText}>{selected.role}</Text>
            </View>
            <Text style={styles.detailSub}>{selected.email}</Text>
            <AppButton
              label="Message in chat"
              onPress={() => {
                const id = selected.id;
                setSelected(null);
                router.push({ pathname: '/(tabs)/chat', params: { with: id } });
              }}
              style={styles.detailCta}
            />
            <AppButton
              label="Open group session"
              variant="ghost"
              onPress={() => {
                setSelected(null);
                router.push({ pathname: '/group-session', params: { exam: '1' } });
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
  screen: { backgroundColor: colors.white, flex: 1, paddingHorizontal: spacing.xl },
  search: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { color: colors.ink, flex: 1, fontSize: 14, paddingVertical: spacing.md },
  list: { gap: spacing.md, paddingBottom: spacing.xxxl, paddingTop: spacing.lg },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surfaceDim,
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  rowSub: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  empty: { color: colors.muted, fontSize: 13, paddingTop: spacing.xl, textAlign: 'center' },
  details: { alignItems: 'center', gap: spacing.sm },
  detailRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  detailText: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  detailSub: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  detailCta: { alignSelf: 'stretch', marginTop: spacing.sm },
});
