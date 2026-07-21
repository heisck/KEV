import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLecturers } from '@/api/hooks';
import { SearchIcon } from '@/components/kev/icons';
import { Avatar } from '@/components/kev/people';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { radii, spacing, usePalette } from '@/theme';

/** Lecturer inbox; threads live in the root stack so they cover the tab bar. */
export function ChatDirectoryScreen() {
  const router = useRouter();
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const threads = useChatStore((state) => state.threads);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [query, setQuery] = useState('');
  const { data: lecturers, isLoading } = useLecturers();
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = (lecturers ?? []).filter(
    (lecturer) =>
      lecturer.id !== currentUserId &&
      (lecturer.displayName || lecturer.email).toLowerCase().includes(normalizedQuery),
  );

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <Text style={[styles.title, { color: p.ink }]}>Chat Directory</Text>
      <Text style={[styles.subtitle, { color: p.muted }]}>
        Select a lecturer to open a conversation.
      </Text>

      <View style={[styles.search, { backgroundColor: p.surfaceDim }]}>
        <SearchIcon color={p.muted} />
        <TextInput
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Search lecturers..."
          placeholderTextColor={p.muted}
          style={[styles.searchInput, { color: p.ink }]}
          testID="chat-search"
          value={query}
        />
      </View>

      <ScrollView contentContainerStyle={styles.inbox} showsVerticalScrollIndicator={false}>
        {isLoading && !lecturers ? (
          <LoadingSkeleton testID="chat-directory-skeleton" variant="rows" />
        ) : (
          filtered.map((lecturer) => {
            const last = threads[lecturer.id]?.at(-1);
            const name = lecturer.displayName || lecturer.email;
            return (
              <HapticPressable
                key={lecturer.id}
                accessibilityLabel={`Chat with ${name}`}
                accessibilityRole="button"
                haptic="select"
                onPress={() => router.push({ pathname: '/chat/[id]', params: { id: lecturer.id } })}
                style={[styles.row, { backgroundColor: p.surfaceDim }]}
                testID={`chat-row-${lecturer.id}`}
              >
                <Avatar person="freja" size={48} verified />
                <View style={styles.rowText}>
                  <Text style={[styles.rowName, { color: p.ink }]}>{name}</Text>
                  <Text style={[styles.rowPreview, { color: p.muted }]} numberOfLines={1}>
                    {last?.text ?? 'Tap to start conversation'}
                  </Text>
                </View>
                {last ? <Text style={[styles.rowTime, { color: p.muted }]}>{last.at}</Text> : null}
              </HapticPressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  search: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: spacing.md },
  inbox: { gap: spacing.sm, paddingBottom: spacing.xxxl, paddingHorizontal: spacing.xl },
  row: {
    alignItems: 'center',
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: '700' },
  rowPreview: { fontSize: 13, fontWeight: '500' },
  rowTime: { fontSize: 11, fontWeight: '600' },
});
