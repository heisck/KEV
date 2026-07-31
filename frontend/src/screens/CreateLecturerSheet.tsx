import { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { CreateLecturerRequestSchema, type CreateLecturerRequest } from '@/api/admin';
import { useCreateLecturer } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import { AppButton } from '@/components/ui';
import { toast } from '@/lib/toast';
import { spacing, usePalette } from '@/theme';

const EMPTY_FORM: CreateLecturerRequest = {
  fullName: '',
  lecturerId: '',
  universityEmail: '',
  personalEmail: '',
  phone: '',
};

type EmailField = 'universityEmail' | 'personalEmail';
type EmailErrors = Partial<Record<EmailField, string>>;

function emailError(field: EmailField, value: string): string | undefined {
  const schema = CreateLecturerRequestSchema.shape[field];
  const parsed = schema.safeParse(value);
  return parsed.success ? undefined : parsed.error.issues[0]?.message;
}

function isEmailField(field: keyof CreateLecturerRequest): field is EmailField {
  return field === 'universityEmail' || field === 'personalEmail';
}

const FIELDS = [
  { name: 'fullName', label: 'Full name', placeholder: 'e.g. Dr. Kwame Mensah' },
  {
    name: 'lecturerId',
    label: 'Lecturer ID number',
    placeholder: 'e.g. LEC-001',
    autoCapitalize: 'characters',
  },
  {
    name: 'universityEmail',
    label: 'University email',
    placeholder: 'e.g. kwame.mensah@university.edu',
    autoCapitalize: 'none',
    keyboardType: 'email-address',
  },
  {
    name: 'personalEmail',
    label: 'Personal email',
    placeholder: 'e.g. kwame.personal@gmail.com',
    autoCapitalize: 'none',
    keyboardType: 'email-address',
  },
  {
    name: 'phone',
    label: 'Phone number',
    placeholder: 'e.g. +233 24 000 0000',
    keyboardType: 'phone-pad',
  },
] satisfies readonly {
  name: keyof CreateLecturerRequest;
  label: string;
  placeholder: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
}[];

export function CreateLecturerSheet({ onClose }: { onClose: () => void }) {
  const p = usePalette();
  const createLecturer = useCreateLecturer();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [emailErrors, setEmailErrors] = useState<EmailErrors>({});

  const submit = () => {
    const input = {
      fullName: form.fullName.trim(),
      lecturerId: form.lecturerId.trim(),
      universityEmail: form.universityEmail.trim(),
      personalEmail: form.personalEmail.trim(),
      phone: form.phone.trim(),
    };
    const parsed = CreateLecturerRequestSchema.safeParse(input);

    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setEmailErrors({
        personalEmail: fields.personalEmail?.[0],
        universityEmail: fields.universityEmail?.[0],
      });
      const hasEmptyField = Object.values(input).some((value) => !value);
      setError(
        hasEmptyField
          ? 'All lecturer details are required.'
          : 'Check the highlighted email addresses.',
      );
      return;
    }

    setError(null);
    setEmailErrors({});
    createLecturer.mutate(parsed.data, {
      onSuccess: () => {
        toast.success('Lecturer account created! Credentials sent.');
        onClose();
      },
      onError: (cause) =>
        setError(getProblemDetail(cause)?.detail ?? 'Could not add the lecturer.'),
    });
  };

  return (
    <View style={styles.form}>
      {error ? <Text style={[styles.error, { color: p.error }]}>{error}</Text> : null}
      {FIELDS.map((field) => (
        <View key={field.name} style={styles.field}>
          <Text style={[styles.label, { color: p.inkSoft }]}>{field.label}</Text>
          <TextInput
            autoCapitalize={field.autoCapitalize}
            autoCorrect={false}
            keyboardType={field.keyboardType}
            onBlur={() => {
              const name = field.name;
              if (!isEmailField(name)) return;
              const validationError = emailError(name, form[name]);
              setEmailErrors((current) => ({
                ...current,
                [name]: validationError,
              }));
            }}
            onChangeText={(value) => {
              setForm((current) => ({ ...current, [field.name]: value }));
              if (isEmailField(field.name)) {
                setEmailErrors((current) => ({ ...current, [field.name]: undefined }));
              }
            }}
            placeholder={field.placeholder}
            placeholderTextColor={p.muted}
            style={[
              styles.input,
              {
                borderColor:
                  isEmailField(field.name) && emailErrors[field.name] ? p.error : p.hairline,
                color: p.ink,
              },
            ]}
            value={form[field.name]}
          />
          {isEmailField(field.name) && emailErrors[field.name] ? (
            <Text style={[styles.fieldError, { color: p.error }]}>
              {emailErrors[field.name]}
            </Text>
          ) : null}
        </View>
      ))}
      <AppButton
        disabled={createLecturer.isPending}
        label={createLecturer.isPending ? 'Creating Lecturer...' : 'Create Lecturer'}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  fieldError: { fontSize: 12, fontWeight: '600' },
  field: { gap: spacing.xs },
  form: { gap: spacing.md, width: '100%' },
  input: { borderRadius: 12, borderWidth: 1, fontSize: 15, height: 48, paddingHorizontal: 14 },
  label: { fontSize: 13, fontWeight: '600' },
});
