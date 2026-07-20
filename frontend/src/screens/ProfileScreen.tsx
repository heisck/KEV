import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CheckInMethod } from '@/api/schemas';
import {
  BackIcon,
  ChevronRightIcon,
  DocIcon,
  LogoutIcon,
  MailIcon,
  PencilIcon,
  PinIcon,
  ScanFrameIcon,
} from '@/components/kev/icons';
import { SegmentedControl, SettingToggle } from '@/components/settings/SettingsControls';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing, usePalette, type Palette } from '@/theme';

const SCAN_OPTIONS: { value: CheckInMethod; label: string }[] = [
  { value: 'FACE', label: 'Face' },
  { value: 'NFC', label: 'NFC' },
  { value: 'MANUAL', label: 'Manual' },
];

/** Small-caps section label above a grouped block. */
function SectionLabel({ text, p }: { text: string; p: Palette }) {
  return <Text style={[styles.sectionLabel, { color: p.muted }]}>{text}</Text>;
}

/** Icon-in-a-tint · label · trailing (chevron by default). */
function Row({
  icon,
  label,
  p,
  onPress,
  danger,
  trailing,
  testID,
}: {
  icon: ReactNode;
  label: string;
  p: Palette;
  onPress?: () => void;
  danger?: boolean;
  trailing?: ReactNode;
  testID?: string;
}) {
  const color = danger ? p.error : p.ink;
  return (
    <HapticPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}
      haptic={onPress ? 'select' : 'none'}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: p.hairline }]}
      testID={testID}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? p.errorSoft : p.mint }]}>
        {icon}
      </View>
      <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      {trailing ?? <ChevronRightIcon color={danger ? p.error : p.muted} />}
    </HapticPressable>
  );
}

/** Profile — identity header, preferences and account rows (reference layout). */
export function ProfileScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const settings = useSettingsStore();
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
        <Text style={[styles.bandTitle, { color: p.onPrimary }]}>Profile</Text>
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
            {user?.pictureUrl ? (
              <Image source={{ uri: user.pictureUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View
                style={[styles.avatar, styles.avatarFallback, { backgroundColor: p.primary12 }]}
              >
                <Text style={[styles.avatarInitial, { color: p.primary }]}>
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.name, { color: p.ink }]}>{name}</Text>
          <Text style={[styles.email, { color: p.muted }]}>{email}</Text>
        </View>

        <SectionLabel text="Location" p={p} />
        <Row
          icon={<PinIcon color={p.primary} size={16} />}
          label="KNUST Campus"
          p={p}
          onPress={() => router.push('/edit-profile')}
        />

        <SectionLabel text="Preferences" p={p} />
        <Row
          icon={<ScanFrameIcon color={p.primary} size={18} />}
          label="Use system appearance"
          p={p}
          trailing={
            <SettingToggle
              value={settings.theme === 'system'}
              onToggle={() => settings.setTheme(settings.theme === 'system' ? 'light' : 'system')}
              testID="setting-system-theme"
            />
          }
        />
        <Row
          icon={<ScanFrameIcon color={p.primary} size={18} />}
          label="Dark mode"
          p={p}
          trailing={
            <SettingToggle
              value={settings.theme === 'dark'}
              onToggle={() => settings.setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
              testID="setting-dark-theme"
            />
          }
        />
        <Row
          icon={<ScanFrameIcon color={p.primary} size={18} />}
          label="Scan method"
          p={p}
          trailing={
            <SegmentedControl
              options={SCAN_OPTIONS}
              value={settings.defaultScanMethod}
              onChange={settings.setDefaultScanMethod}
              palette={p}
            />
          }
        />
        <Row
          icon={<DocIcon color={p.primary} size={18} />}
          label="Show result page"
          p={p}
          trailing={
            <SettingToggle
              value={settings.showSuccessPage}
              onToggle={() => settings.setShowSuccessPage(!settings.showSuccessPage)}
              testID="setting-success-page"
            />
          }
        />
        <Row
          icon={<MailIcon color={p.primary} size={18} />}
          label="Notifications"
          p={p}
          trailing={
            <SettingToggle
              value={settings.notificationsEnabled}
              onToggle={() => settings.setNotificationsEnabled(!settings.notificationsEnabled)}
              testID="setting-notifications"
            />
          }
        />

        <SectionLabel text="Account" p={p} />
        <Row
          icon={<DocIcon color={p.primary} size={18} />}
          label="Recent reports"
          p={p}
          onPress={() => router.push('/(tabs)')}
        />
        <Row
          icon={<MailIcon color={p.primary} size={18} />}
          label="Email-in"
          p={p}
          onPress={() => router.push('/edit-profile')}
        />
        <Row
          icon={<LogoutIcon color={p.error} size={18} />}
          label="Log out"
          p={p}
          danger
          onPress={() => void signOut()}
          testID="profile-sign-out"
        />

        <Text style={[styles.version, { color: p.muted }]}>KEV exam verifier · v{version}</Text>
      </ScrollView>
    </View>
  );
}

const AVATAR = 92;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  band: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  bandBtn: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  bandTitle: { fontSize: 18, fontWeight: '700' },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    flex: 1,
    marginTop: -spacing.md,
  },
  sheetBody: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.xl },
  identity: { alignItems: 'center', paddingBottom: spacing.md, paddingTop: spacing.xl },
  avatarRing: { borderRadius: (AVATAR + 12) / 2, borderWidth: 3, padding: 3 },
  avatar: { borderRadius: AVATAR / 2, height: AVATAR, width: AVATAR },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 34, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', marginTop: spacing.md },
  email: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingBottom: spacing.xs,
    paddingTop: spacing.xl,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  version: { fontSize: 12, fontWeight: '500', paddingTop: spacing.xl, textAlign: 'center' },
});
