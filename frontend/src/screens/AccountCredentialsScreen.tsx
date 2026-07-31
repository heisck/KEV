import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getProblemDetail } from '@/api/schemas';
import { BackIcon, LockIcon } from '@/components/kev/icons';
import { AppButton } from '@/components/ui/AppButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { toast } from '@/lib/toast';
import { accountCredentialsStyles as styles } from '@/screens/accountCredentialsStyles';
import { useAuthStore } from '@/store/authStore';
import { spacing, usePalette, type Palette } from '@/theme';

function Field({
  label,
  value,
  onChange,
  p,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  p: Palette;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: p.muted }]}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="default"
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={p.muted}
        secureTextEntry
        style={[styles.input, { borderBottomColor: p.hairline, color: p.ink }]}
        value={value}
      />
    </View>
  );
}

export function AccountCredentialsScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const p = usePalette();
  const user = useAuthStore((state) => state.user);
  const updateCredentials = useAuthStore((state) => state.updateCredentials);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!currentPassword) return toast.error('Enter your current password');
    if (!newPassword) return toast.error('Enter a new password');
    if (newPassword.length < 8) return toast.error('Password needs at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    setSaving(true);
    try {
      await updateCredentials({
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully');
      router.back();
    } catch (error: unknown) {
      toast.error(getProblemDetail(error)?.detail ?? 'Could not update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: p.primary }]}>
      <View style={[styles.band, { paddingTop: top + spacing.sm }]}>
        <HapticPressable
          accessibilityLabel="Cancel"
          accessibilityRole="button"
          haptic="select"
          onPress={() => router.back()}
          style={styles.bandBtn}
        >
          <BackIcon color={p.onPrimary} size={20} />
        </HapticPressable>
        <Text style={[styles.bandTitle, { color: p.onPrimary }]}>Change Password</Text>
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
            {user?.pictureUrl ? (
              <Image source={{ uri: user.pictureUrl }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View
                style={[styles.avatar, styles.avatarFallback, { backgroundColor: p.primary12 }]}
              >
                <Text style={[styles.avatarInitial, { color: p.primary }]}>
                  {(user?.displayName || 'K').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: p.primary, borderColor: p.bg }]}>
              <LockIcon color={p.onPrimary} size={12} />
            </View>
          </View>
        </View>

        <Field
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          p={p}
        />
        <Field label="New Password" value={newPassword} onChange={setNewPassword} p={p} />
        <Field
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          p={p}
        />

        <View style={styles.actions}>
          <AppButton
            label="Cancel"
            variant="ghost"
            onPress={() => router.back()}
            style={styles.action}
          />
          <AppButton
            label={saving ? 'Saving...' : 'Save'}
            disabled={saving}
            onPress={save}
            style={styles.action}
            testID="credentials-save"
          />
        </View>
      </ScrollView>
    </View>
  );
}
