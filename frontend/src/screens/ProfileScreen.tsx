import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogoMark } from '@/components/AppLogoMark';
import {
  BackIcon,
  DocIcon,
  LogoutIcon,
  MailIcon,
  PencilIcon,
  PinIcon,
} from '@/components/kev/icons';
import { ProfilePreferences } from '@/components/settings/ProfilePreferences';
import { ProfileRow as Row, SectionLabel } from '@/components/settings/ProfileSettingsRows';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { useAuthStore } from '@/store/authStore';
import { spacing, usePalette } from '@/theme';
import { profileStyles as styles } from '@/screens/profileStyles';

/** Profile — identity header, preferences and account rows (reference layout). */
export function ProfileScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const name = user?.displayName ?? 'Invigilator';
  const email = user?.email ?? 'No email on file';

  return (
    <View style={[styles.screen, { backgroundColor: p.primary }]}>
      <View style={[styles.band, { paddingTop: top + spacing.sm }]}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          haptic="select"
          onPress={() => router.replace('/(tabs)/chat')}
          style={styles.bandBtn}
        >
          <BackIcon color={p.onPrimary} size={20} />
        </HapticPressable>
        <AppLogoMark color={p.onPrimary} scale={0.25} />
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
          haptic="select"
          onPress={() => router.push('/edit-profile')}
          style={styles.bandBtn}
        >
          <PencilIcon color={p.onPrimary} size={16} />
        </HapticPressable>
      </View>

      <ScrollView
        style={[styles.sheet, { backgroundColor: p.bg }]}
        contentContainerStyle={styles.sheetBody}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identity}>
          <View style={[styles.avatarRing, { borderColor: p.hairline }]}>
            <InitialAvatar
              uri={user?.pictureUrl}
              seed={name}
              imageStyle={styles.avatar}
              fallbackStyle={[
                styles.avatar,
                styles.avatarFallback,
                { backgroundColor: p.primary12 },
              ]}
              initialStyle={[styles.avatarInitial, { color: p.primary }]}
            />
          </View>
          <Text style={[styles.name, { color: p.ink }]}>{name}</Text>
          <Text style={[styles.email, { color: p.muted }]}>{email}</Text>
        </View>

        <SectionLabel text="Location" palette={p} />
        <Row
          icon={<PinIcon color={p.primary} size={16} />}
          label="KNUST Campus"
          palette={p}
          onPress={() => router.push('/edit-profile')}
        />

        <ProfilePreferences palette={p} />

        <SectionLabel text="Account" palette={p} />
        <Row
          icon={<DocIcon color={p.primary} size={18} />}
          label="Reports"
          palette={p}
          onPress={() => router.push('/reports')}
        />
        <Row
          icon={<MailIcon color={p.primary} size={18} />}
          label="Email in"
          palette={p}
          onPress={() => router.push('/account-credentials')}
        />
        <Row
          icon={<LogoutIcon color={p.error} size={18} />}
          label="Log out"
          palette={p}
          danger
          onPress={() => void signOut()}
          testID="profile-sign-out"
        />

        <Text style={[styles.version, { color: p.muted }]}>KEV exam verifier · v{version}</Text>
      </ScrollView>
    </View>
  );
}
