import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getProblemDetail } from '@/api/schemas';
import { CredentialsKeyIcon } from '@/components/auth/CredentialsKeyIcon';
import { BackIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import { radii, spacing, usePalette, type Palette } from '@/theme';

function SecureField({
  label,
  value,
  onChange,
  p,
  email,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  p: Palette;
  email?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: p.muted }]}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={email ? 'email-address' : 'default'}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={p.muted}
        secureTextEntry={!email}
        style={[styles.input, { backgroundColor: p.input, color: p.ink }]}
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
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const changedEmail = email.trim().toLowerCase() !== user?.email.toLowerCase();
    if (!currentPassword) return toast.error('Enter your current password');
    if (!changedEmail && !newPassword) return toast.error('Enter a new email or password');
    if (newPassword && newPassword.length < 8)
      return toast.error('Password needs at least 8 characters');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    setSaving(true);
    try {
      await updateCredentials({
        currentPassword,
        email: changedEmail ? email.trim() : undefined,
        newPassword: newPassword || undefined,
      });
      toast.success('Sign-in details updated');
      router.back();
    } catch (error: unknown) {
      toast.error(getProblemDetail(error)?.detail ?? 'Could not update sign-in details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: p.primary }]}>
      <View style={[styles.header, { paddingTop: top + spacing.sm }]}>
        <HapticPressable
          accessibilityLabel="Back to profile"
          accessibilityRole="button"
          haptic="select"
          onPress={() => router.back()}
          style={styles.back}
        >
          <BackIcon color={p.onPrimary} />
        </HapticPressable>
        <Text style={[styles.title, { color: p.onPrimary }]}>Email in</Text>
        <View style={styles.back} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.sheet, { backgroundColor: p.bg }]}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CredentialsKeyIcon color={p.inkSoft} outline={p.hairline} surface={p.surfaceDim} />
          <Text style={[styles.intro, { color: p.ink }]}>Reset Password</Text>
          <Text style={[styles.hint, { color: p.muted }]}>
            Enter your new password below, we’re just being extra safe
          </Text>
          <View style={styles.form}>
            <SecureField email label="Sign-in email" onChange={setEmail} p={p} value={email} />
            <SecureField
              label="Current Password"
              onChange={setCurrentPassword}
              p={p}
              value={currentPassword}
            />
            <SecureField label="New Password" onChange={setNewPassword} p={p} value={newPassword} />
            <SecureField
              label="Confirm Password"
              onChange={setConfirmPassword}
              p={p}
              value={confirmPassword}
            />
            <HapticPressable
              accessibilityRole="button"
              disabled={saving}
              haptic="success"
              onPress={save}
              style={styles.saveShell}
              testID="credentials-save"
            >
              <View style={[styles.save, { backgroundColor: p.primary }]}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>SAVE</Text>
                )}
              </View>
            </HapticPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  back: { alignItems: 'center', height: 40, justifyContent: 'center', width: 40 },
  title: { fontSize: 18, fontWeight: '700' },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    flex: 1,
    marginTop: -spacing.md,
  },
  body: {
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  intro: { fontSize: 18, fontWeight: '700', marginTop: spacing.md },
  hint: { fontSize: 12, lineHeight: 17, marginTop: spacing.sm, maxWidth: 240, textAlign: 'center' },
  form: { gap: spacing.md, marginTop: spacing.xxl, maxWidth: 360, width: '100%' },
  field: { alignItems: 'center', gap: spacing.xs },
  label: { fontSize: 11, fontWeight: '500' },
  input: {
    borderRadius: radii.pill,
    fontSize: 14,
    minHeight: 42,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    textAlign: 'center',
    width: '100%',
  },
  saveShell: { borderRadius: radii.pill, marginTop: spacing.sm, overflow: 'hidden' },
  save: { alignItems: 'center', borderRadius: radii.pill, height: 44, justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
});
