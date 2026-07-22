import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useCreateLecturer } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import { AppButton } from '@/components/ui';
import { spacing, usePalette } from '@/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateLecturerSheet({ onClose }: { onClose: () => void }) {
  const p = usePalette();
  const createLecturer = useCreateLecturer();

  const [fullName, setFullName] = useState('');
  const [lecturerId, setLecturerId] = useState('');
  const [universityEmail, setUniversityEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [uniEmailError, setUniEmailError] = useState<string | null>(null);
  const [uniEmailTouched, setUniEmailTouched] = useState(false);
  const [personalEmailError, setPersonalEmailError] = useState<string | null>(null);
  const [personalEmailTouched, setPersonalEmailTouched] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Email is required';
    if (!EMAIL_REGEX.test(trimmed)) return 'Incorrect email address';
    return null;
  };

  const handleUniEmailBlur = useCallback(() => {
    setUniEmailTouched(true);
    setUniEmailError(validateEmail(universityEmail));
  }, [universityEmail]);

  const handlePersonalEmailBlur = useCallback(() => {
    setPersonalEmailTouched(true);
    setPersonalEmailError(validateEmail(personalEmail));
  }, [personalEmail]);

  const handleSubmit = () => {
    setFormError(null);
    const uErr = validateEmail(universityEmail);
    const pErr = validateEmail(personalEmail);
    setUniEmailTouched(true);
    setPersonalEmailTouched(true);
    setUniEmailError(uErr);
    setPersonalEmailError(pErr);

    if (uErr || pErr) return;
    if (!fullName.trim() || !lecturerId.trim() || !phone.trim()) {
      setFormError('All fields are required.');
      return;
    }

    createLecturer.mutate(
      {
        fullName: fullName.trim(),
        lecturerId: lecturerId.trim(),
        universityEmail: universityEmail.trim(),
        personalEmail: personalEmail.trim(),
        phone: phone.trim(),
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          const detail = getProblemDetail(err);
          setFormError(detail?.detail ?? detail?.title ?? 'Failed to create lecturer');
        },
      },
    );
  };

  return (
    <View style={styles.container}>
      {formError ? <Text style={[styles.serverError, { color: p.error }]}>{formError}</Text> : null}

      <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Full Name</Text>
      <TextInput
        placeholder="e.g. Dr. Kwame Mensah"
        placeholderTextColor={p.muted}
        style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Lecturer ID Number</Text>
      <TextInput
        placeholder="e.g. LEC-001"
        placeholderTextColor={p.muted}
        style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
        value={lecturerId}
        onChangeText={setLecturerId}
      />

      <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>University Email</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="e.g. kwame.mensah@university.edu"
        placeholderTextColor={p.muted}
        style={[
          styles.input,
          { color: p.ink, borderColor: p.hairline },
          Boolean(uniEmailError) && uniEmailTouched && styles.inputError,
        ]}
        value={universityEmail}
        onBlur={handleUniEmailBlur}
        onChangeText={(txt) => {
          setUniversityEmail(txt);
          if (uniEmailTouched) setUniEmailError(validateEmail(txt));
        }}
      />
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { opacity: uniEmailError && uniEmailTouched ? 1 : 0 }]}>
          {uniEmailError ?? ' '}
        </Text>
      </View>

      <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Personal Email</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="e.g. kwame.personal@gmail.com"
        placeholderTextColor={p.muted}
        style={[
          styles.input,
          { color: p.ink, borderColor: p.hairline },
          Boolean(personalEmailError) && personalEmailTouched && styles.inputError,
        ]}
        value={personalEmail}
        onBlur={handlePersonalEmailBlur}
        onChangeText={(txt) => {
          setPersonalEmail(txt);
          if (personalEmailTouched) setPersonalEmailError(validateEmail(txt));
        }}
      />
      <View style={styles.errorContainer}>
        <Text
          style={[
            styles.errorText,
            { opacity: personalEmailError && personalEmailTouched ? 1 : 0 },
          ]}
        >
          {personalEmailError ?? ' '}
        </Text>
      </View>

      <Text style={[styles.fieldLabel, { color: p.inkSoft }]}>Phone Number</Text>
      <TextInput
        keyboardType="phone-pad"
        placeholder="e.g. +233 24 000 0000"
        placeholderTextColor={p.muted}
        style={[styles.input, { color: p.ink, borderColor: p.hairline }]}
        value={phone}
        onChangeText={setPhone}
      />

      <View style={styles.buttonRow}>
        <AppButton
          disabled={createLecturer.isPending}
          label={createLecturer.isPending ? 'Creating...' : 'Create Lecturer'}
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
