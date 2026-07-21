import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { useJoinSessionById } from '@/api/hooks';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { radii, spacing, usePalette } from '@/theme';

type SessionJoinDrawerProps = {
  sessionId: number;
  visible: boolean;
  onClose: () => void;
  onJoined: () => void;
};

/** Password gate shown from an unjoined session preview. */
export function SessionJoinDrawer({
  sessionId,
  visible,
  onClose,
  onJoined,
}: SessionJoinDrawerProps) {
  const p = usePalette();
  const join = useJoinSessionById(sessionId);
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState(false);
  const submit = async () => {
    if (!password.trim()) return;
    try {
      await join.mutateAsync(password.trim());
      setPassword('');
      setInvalid(false);
      onJoined();
      onClose();
    } catch {
      setInvalid(true);
    }
  };

  return (
    <BottomDrawer
      visible={visible}
      onClose={onClose}
      title="Join session"
      testID="join-session-drawer"
    >
      <Text style={[styles.hint, { color: p.muted }]}>Enter the session password to scan.</Text>
      <TextInput
        autoCapitalize="characters"
        autoFocus
        onChangeText={(value) => {
          setPassword(value);
          setInvalid(false);
        }}
        onSubmitEditing={submit}
        placeholder="Session password"
        placeholderTextColor={p.muted}
        returnKeyType="go"
        style={[styles.input, { borderColor: invalid ? p.error : p.hairline, color: p.ink }]}
        testID="join-session-password"
        value={password}
      />
      {invalid ? (
        <Text style={[styles.error, { color: p.error }]}>Wrong password. Try again.</Text>
      ) : null}
      <HapticPressable
        accessibilityRole="button"
        onPress={submit}
        style={[styles.submit, { backgroundColor: p.primary }]}
        testID="join-session-submit"
      >
        <Text style={[styles.submitText, { color: p.onPrimary }]}>Join session</Text>
      </HapticPressable>
    </BottomDrawer>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 13, fontWeight: '500' },
  input: { borderRadius: radii.md, borderWidth: 1, fontSize: 16, padding: spacing.md },
  error: { fontSize: 12, fontWeight: '600' },
  submit: { alignItems: 'center', borderRadius: radii.pill, padding: spacing.md },
  submitText: { fontSize: 14, fontWeight: '700' },
});
