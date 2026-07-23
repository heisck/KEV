import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon, PencilIcon } from '@/components/kev/icons';
import { AppButton } from '@/components/ui/AppButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { useAuthStore } from '@/store/authStore';
import { radii, spacing, usePalette, type Palette } from '@/theme';

/** Labelled text field matching the app's form input style. */
function Field({
  label,
  value,
  onChange,
  keyboardType,
  p,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  keyboardType?: 'email-address' | 'default';
  p: Palette;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: p.muted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={p.muted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        style={[styles.input, { color: p.ink, borderBottomColor: p.hairline }]}
      />
    </View>
  );
}

/** Edit Profile — display name / email / location, saved to the auth store. */
export function EditProfileScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [location, setLocation] = useState('KNUST Campus');

  const save = () => {
    updateProfile({ displayName: displayName.trim(), email: email.trim() });
    router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: p.primary }]}>
      <View style={[styles.band, { paddingTop: top + spacing.sm }]}>
        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          haptic="select"
          onPress={() => router.back()}
          style={styles.bandBtn}
        >
          <BackIcon color={p.onPrimary} size={20} />
        </HapticPressable>
        <Text style={[styles.bandTitle, { color: p.onPrimary }]}>Edit Profile</Text>
        <View style={styles.bandBtn} />
      </View>

      <ScrollView
        style={[styles.sheet, { backgroundColor: p.bg }]}
        contentContainerStyle={styles.sheetBody}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.identity}>
          <View style={[styles.avatarRing, { borderColor: p.hairline }]}>
            <InitialAvatar
              uri={user?.pictureUrl}
              seed={displayName || 'K'}
              imageStyle={styles.avatar}
              fallbackStyle={[
                styles.avatar,
                styles.avatarFallback,
                { backgroundColor: p.primary12 },
              ]}
              initialStyle={[styles.avatarInitial, { color: p.primary }]}
            />
            <View style={[styles.editBadge, { backgroundColor: p.primary, borderColor: p.bg }]}>
              <PencilIcon color={p.onPrimary} size={12} />
            </View>
          </View>
        </View>

        <Field label="Display name" value={displayName} onChange={setDisplayName} p={p} />
        <Field
          label="E-mail"
          value={email}
          onChange={setEmail}
          keyboardType="email-address"
          p={p}
        />
        <Field label="Location" value={location} onChange={setLocation} p={p} />

        <View style={styles.actions}>
          <AppButton
            label="Cancel"
            variant="ghost"
            onPress={() => router.back()}
            style={styles.action}
          />
          <AppButton label="Save" onPress={save} style={styles.action} testID="edit-profile-save" />
        </View>
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
  identity: { alignItems: 'center', paddingBottom: spacing.lg, paddingTop: spacing.xl },
  avatarRing: { borderRadius: (AVATAR + 12) / 2, borderWidth: 3, padding: 3 },
  avatar: { borderRadius: AVATAR / 2, height: AVATAR, width: AVATAR },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 34, fontWeight: '800' },
  editBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 2,
    bottom: 2,
    height: 26,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 26,
  },
  field: { gap: spacing.xs, paddingTop: spacing.lg },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: spacing.sm,
  },
  actions: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.xxxl },
  action: { flex: 1 },
});
