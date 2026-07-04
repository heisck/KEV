import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, Card, ListRow, StatusPill } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { colors, radii, spacing, typography } from '@/theme';

/** Profile card, static settings rows and sign-out. */
export function ProfileScreen() {
  const { top } = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Profile</Text>

      <Card style={styles.profileCard}>
        {user?.pictureUrl ? (
          <Image source={{ uri: user.pictureUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>
              {(user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user?.displayName ?? 'Invigilator'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.pillRow}>
          <StatusPill label={user?.role ?? 'USER'} tone="neutral" />
          <StatusPill
            label={user?.plan ?? 'FREE'}
            tone={user?.plan === 'PREMIUM' ? 'success' : 'warn'}
          />
        </View>
      </Card>

      <View style={styles.settings}>
        <ListRow title="Appearance" subtitle="System" />
        <ListRow title="Notifications" subtitle="On" />
        <ListRow title="About KEV" subtitle={`Version ${version}`} />
      </View>

      <AppButton
        label="Sign out"
        variant="danger"
        onPress={() => void signOut()}
        testID="profile-sign-out"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: 120, paddingHorizontal: spacing.xl },
  title: { color: colors.ink, fontFamily: typography.display, fontSize: 28 },
  profileCard: { alignItems: 'center', gap: spacing.sm },
  avatar: { borderRadius: radii.pill, height: 84, width: 84 },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: colors.primary20,
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.primaryDeep, fontSize: 32, fontWeight: '700' },
  name: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  email: { color: colors.muted, fontSize: 14 },
  pillRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  settings: { gap: spacing.sm },
});
