import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useCreateAdmin } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import { AppButton } from '@/components/ui';
import { spacing, usePalette } from '@/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateAdminSheet({ onClose }: { onClose: () => void }) {
  const p = usePalette();
  const createAdmin = useCreateAdmin();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Email is required';
    if (!EMAIL_REGEX.test(trimmed)) return 'Incorrect email address';
    return null;
  };

  const handleEmailBlur = useCallback(() => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  }, [email]);

  const handleSubmit = () => {
    setFormError(null);
    const err = validateEmail(email);
    setEmailTouched(true);
    setEmailError(err);

    if (err) return;
    if (!fullName.trim() || !password.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    createAdmin.mutate(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (e) => {
          const detail = getProblemDetail(e);
          setFormError(detail?.detail ?? detail?.title ?? 'Failed to create admin');
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      {formError ? <Text style={[styles.serverError, { color: p.error }]}>{formError}</Text> : null}

      <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Full Name</Text>
      <TextInput
        placeholder="e.g. System Admin"
        placeholderTextColor={p.muted}
        style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Email Address</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="e.g. admin2@kev.app"
        placeholderTextColor={p.muted}
        style={[
          styles.input,
          { color: p.ink, borderColor: p.hairline },
          Boolean(emailError) && emailTouched && styles.inputError,
        ]}
        value={email}
        onBlur={handleEmailBlur}
        onChangeText={(txt) => {
          setEmail(txt);
          if (emailTouched) setEmailError(validateEmail(txt));
        }}
      />
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { opacity: emailError && emailTouched ? 1 : 0 }]}>
          {emailError ?? ' '}
        </Text>
      </View>

      <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Password</Text>
      <TextInput
        secureTextEntry
        placeholder="At least 6 characters"
        placeholderTextColor={p.muted}
        style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonRow}>
        <AppButton
          disabled={createAdmin.isPending}
          label={createAdmin.isPending ? 'Creating...' : 'Create Admin'}
          variant="primary"
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs, paddingVertical: spacing.sm },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginTop: spacing.xs },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    height: 48,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#FF4D4D',
  },
  errorContainer: {
    height: 18,
    justifyContent: 'center',
    paddingLeft: 4,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    fontWeight: '600',
  },
  serverError: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonRow: { marginTop: spacing.md },
});
