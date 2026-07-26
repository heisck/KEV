import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionDetail } from '@/api/hooks';
import { isPastSession } from '@/lib/sessionLifecycle';
import { toast } from '@/lib/toast';
import { useSyncStore } from '@/store/syncStore';
import { radii, spacing, usePalette } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  indexFrom?: number | string;
  indexTo?: number | string;
};

export function SessionRosterDrawer({
  visible,
  onClose,
  sessionId,
  indexFrom = 6180723,
  indexTo = 6180824,
}: Props) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const { cachedRoster, loadCachedStudents, clearRoster, startSync, isSyncing } = useSyncStore();
  const { data: detail } = useSessionDetail(Number(sessionId) || 1);
  const isClosed = isPastSession(detail?.session?.status);

  const students = cachedRoster[sessionId] ?? [];

  useEffect(() => {
    if (visible && sessionId) {
      setLoading(true);
      void loadCachedStudents(sessionId).finally(() => setLoading(false));
    }
  }, [visible, sessionId, loadCachedStudents]);

  const handleClear = useCallback(async () => {
    await clearRoster(sessionId);
    toast.info('Session student roster cleared from local cache');
  }, [clearRoster, sessionId]);

  const handleResync = useCallback(async () => {
    if (isClosed) {
      toast.info(
        'This session is closed. Synced student roster cannot be requested for past sessions.',
      );
      return;
    }
    try {
      await startSync(
        {
          indexFrom: Number(indexFrom),
          indexTo: Number(indexTo),
          requestedBy: 'Lecturer',
          deviceInfo: 'Mobile App',
        },
        sessionId,
      );
      toast.success('Synced student roster updated successfully!');
      void loadCachedStudents(sessionId);
    } catch {
      toast.error('Could not sync student roster from external server');
    }
  }, [isClosed, startSync, indexFrom, indexTo, sessionId, loadCachedStudents]);

  const filtered = students.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      s.indexNumber.toLowerCase().includes(q) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.nfcCode && s.nfcCode.toLowerCase().includes(q))
    );
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.container,
            {
              backgroundColor: palette.card,
              paddingTop: Math.max(insets.top, spacing.md),
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: palette.hairline }]}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.title, { color: palette.ink }]}>Synced Student Roster</Text>
              <View style={[styles.countBadge, { backgroundColor: palette.primary12 }]}>
                <Text style={[styles.countText, { color: palette.primary }]}>
                  {students.length} Total
                </Text>
              </View>
            </View>
            <Pressable hitSlop={12} onPress={onClose}>
              <Ionicons name="close-circle" size={26} color={palette.inkSoft} />
            </Pressable>
          </View>

          {/* Search Input */}
          <View
            style={[
              styles.searchBox,
              { backgroundColor: palette.input, borderColor: palette.hairline },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={palette.inkSoft} />
            <TextInput
              style={[styles.searchInput, { color: palette.ink }]}
              placeholder="Search by index, name, or NFC..."
              placeholderTextColor={palette.muted}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <Ionicons name="close" size={16} color={palette.inkSoft} />
              </Pressable>
            )}
          </View>

          {/* Student List */}
          {loading || isSyncing ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={palette.primary} />
              <Text style={[styles.loadingText, { color: palette.inkSoft }]}>
                Loading synced student roster...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons name="people-outline" size={48} color={palette.inkSoft} />
              <Text style={[styles.emptyTitle, { color: palette.ink }]}>
                {students.length === 0 ? 'No Cached Student Roster' : 'No Matching Students'}
              </Text>
              <Text style={[styles.emptySub, { color: palette.inkSoft }]}>
                {students.length === 0
                  ? 'Request student data from external server below to enable offline scanning.'
                  : 'Try adjusting your search query.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id || item.indexNumber)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={[styles.studentCard, { borderColor: palette.hairline }]}>
                  <Image
                    source={
                      item.imageBase64
                        ? { uri: item.imageBase64 }
                        : item.imageUrl
                          ? { uri: item.imageUrl }
                          : {
                              uri: `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}`,
                            }
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: palette.ink }]}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={[styles.studentIndex, { color: palette.inkSoft }]}>
                      Index: {item.indexNumber} {item.nfcCode ? `• NFC: ${item.nfcCode}` : ''}
                    </Text>
                  </View>
                </View>
              )}
            />
          )}

          {/* Actions Footer */}
          <View style={[styles.footer, { borderTopColor: palette.hairline }]}>
            <Pressable
              style={[styles.actionBtn, styles.clearBtn, { borderColor: palette.danger }]}
              onPress={handleClear}
            >
              <Ionicons name="trash-outline" size={18} color={palette.danger} />
              <Text style={[styles.actionText, { color: palette.danger }]}>Clear Roster</Text>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, { backgroundColor: palette.primary }]}
              onPress={handleResync}
            >
              <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Re-Sync Data</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '100%',
    width: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.xs + 2,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
  },
  studentIndex: {
    fontSize: 13,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  clearBtn: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
