import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useAdminAdmins,
  useAdminLecturers,
  useRemoveAdmin,
  useRemoveLecturer,
} from '@/api/hooks';
import type { UserDto } from '@/api/schemas';
import { ScreenTopBar } from '@/components/kev/chrome';
import { ListRow } from '@/components/ui';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { useAuthStore } from '@/store/authStore';
import { spacing, usePalette } from '@/theme';

type UserSectionProps = {
  emptyMessage: string;
  title: string;
  users: UserDto[];
  currentUserId?: string;
  onRemove: (user: UserDto) => void;
};

function UserSection({ currentUserId, emptyMessage, onRemove, title, users }: UserSectionProps) {
  const p = usePalette();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: p.ink }]}>{title}</Text>
      {users.map((user) => (
        <ListRow
          key={user.id}
          title={user.displayName || user.email}
          subtitle={user.email}
          avatarUrl={user.pictureUrl ?? undefined}
          trailing={
            user.id !== currentUserId ? (
              <HapticPressable
                accessibilityLabel={`Remove ${user.displayName || user.email}`}
                accessibilityRole="button"
                haptic="select"
                onPress={() => onRemove(user)}
                style={[styles.removeButton, { backgroundColor: p.errorSoft }]}
              >
                <Text style={[styles.removeText, { color: p.error }]}>Remove</Text>
              </HapticPressable>
            ) : undefined
          }
        />
      ))}
      {users.length === 0 ? (
        <Text style={[styles.empty, { color: p.muted }]}>{emptyMessage}</Text>
      ) : null}
    </View>
  );
}

export function AdminUserDirectoryScreen() {
  const router = useRouter();
  const p = usePalette();
  const { top } = useSafeAreaInsets();
  const lecturers = useAdminLecturers();
  const admins = useAdminAdmins();
  const removeLecturer = useRemoveLecturer();
  const removeAdmin = useRemoveAdmin();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const loading = lecturers.isLoading || admins.isLoading;

  const confirmRemoval = (user: UserDto, remove: (id: string) => void) => {
    const name = user.displayName || user.email;
    Alert.alert(
      `Remove ${name}?`,
      'This account will be deactivated and removed from this list.',
      [
        { style: 'cancel', text: 'Cancel' },
        { style: 'destructive', text: 'Remove', onPress: () => remove(user.id) },
      ],
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: p.bg, paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Lecturers & Admins" onBack={() => router.back()} />
      {loading ? (
        <ActivityIndicator color={p.primary} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <UserSection
            title="Lecturers"
            users={lecturers.data ?? []}
            emptyMessage="No lecturers have been added yet."
            currentUserId={currentUserId}
            onRemove={(user) => confirmRemoval(user, removeLecturer.mutate)}
          />
          <UserSection
            title="Administrators"
            users={admins.data ?? []}
            emptyMessage="No administrators have been added yet."
            currentUserId={currentUserId}
            onRemove={(user) => confirmRemoval(user, removeAdmin.mutate)}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xxl, paddingBottom: spacing.xxxl, paddingTop: spacing.xl },
  empty: { fontSize: 13, paddingVertical: spacing.lg, textAlign: 'center' },
  loader: { marginTop: spacing.xxxl },
  removeButton: { borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  removeText: { fontSize: 12, fontWeight: '700' },
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: spacing.xs },
});
