import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { useJoinSession } from '@/api/hooks';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';

/** Home entry point for joining another lecturer's persisted session. */
export function JoinSessionButton() {
  const router = useRouter();
  const palette = usePalette();
  const join = useJoinSession();
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState(false);
  const submit = async () => {
    if (!password.trim()) return;
    try {
      const session = await join.mutateAsync(password.trim());
      setVisible(false);
      setPassword('');
      router.push({ pathname: '/group-session', params: { exam: String(session.id) } });
    } catch {
      setInvalid(true);
    }
  };

  return (
    <>
      <HapticPressable
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={[styles.trigger, { backgroundColor: palette.primary12 }]}
      >
        <Text style={[styles.triggerText, { color: palette.primary }]}>
          Join session with password
        </Text>
      </HapticPressable>
      <BottomDrawer visible={visible} onClose={() => setVisible(false)} title="Join session">
        <TextInput
          autoCapitalize="characters"
          autoFocus
          onChangeText={(value) => {
            setPassword(value);
            setInvalid(false);
          }}
          onSubmitEditing={submit}
          placeholder="Session password"
          placeholderTextColor={palette.muted}
          returnKeyType="go"
          style={[
            styles.input,
            { borderColor: invalid ? palette.error : palette.hairline, color: palette.ink },
          ]}
          testID="home-join-password"
          value={password}
        />
        {invalid ? (
          <Text style={[styles.error, { color: palette.error }]}>Wrong password. Try again.</Text>
        ) : null}
        <HapticPressable
          accessibilityRole="button"
          onPress={submit}
          style={[styles.submit, { backgroundColor: palette.primary }]}
          testID="home-join-submit"
        >
          <Text style={[styles.submitText, { color: palette.onPrimary }]}>Join session</Text>
        </HapticPressable>
      </BottomDrawer>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: 'center',
    borderRadius: radii.pill,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  triggerText: { fontSize: 13, fontWeight: '700' },
  input: { borderRadius: radii.md, borderWidth: 1, fontSize: 16, padding: spacing.md },
  error: { fontSize: 12, fontWeight: '600' },
  submit: { alignItems: 'center', borderRadius: radii.pill, padding: spacing.md },
  submitText: { fontSize: 14, fontWeight: '700' },
});
