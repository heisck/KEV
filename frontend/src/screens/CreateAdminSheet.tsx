import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { CreateAdminRequestSchema, type CreateAdminRequest } from '@/api/admin';
import { useCreateAdmin } from '@/api/hooks';
import { getProblemDetail } from '@/api/schemas';
import { AppButton } from '@/components/ui';
import { toast } from '@/lib/toast';
import { spacing, usePalette } from '@/theme';

const EMPTY_FORM: CreateAdminRequest = {
  email: '',
  firstName: '',
  lastName: '',
  personalEmail: '',
  phone: '',
};

type EmailField = 'email' | 'personalEmail';
type EmailErrors = Partial<Record<EmailField, string>>;

function emailError(field: EmailField, value: string): string | undefined {
  const parsed = CreateAdminRequestSchema.shape[field].safeParse(value);
  return parsed.success ? undefined : parsed.error.issues[0]?.message;
}

export function CreateAdminSheet({ onClose }: { onClose: () => void }) {
  const p = usePalette();
  const createAdmin = useCreateAdmin();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [emailErrors, setEmailErrors] = useState<EmailErrors>({});

  const submit = () => {
    const parsed = CreateAdminRequestSchema.safeParse({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      personalEmail: form.personalEmail.trim(),
      phone: form.phone?.trim() || undefined,
    });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setEmailErrors({ email: fields.email?.[0], personalEmail: fields.personalEmail?.[0] });
      const missingName = !form.firstName.trim() || !form.lastName.trim();
      setError(
        missingName
          ? 'First name and last name are required.'
          : 'Check the highlighted email addresses.',
      );
      return;
    }

    setError(null);
    setEmailErrors({});
    createAdmin.mutate(parsed.data, {
      onSuccess: () => {
        toast.success('Administrator account created! Credentials sent.');
        onClose();
      },
      onError: (cause) =>
        setError(getProblemDetail(cause)?.detail ?? 'Could not create the administrator.'),
    });
  };

  return (
    <View style={styles.form}>
      {error ? <Text style={[styles.error, { color: p.error }]}>{error}</Text> : null}
      <Field
        label="First Name"
        placeholder="First name"
        value={form.firstName}
        onChange={(firstName) => setForm((current) => ({ ...current, firstName }))}
      />
      <Field
        label="Last Name"
        placeholder="Last name"
        value={form.lastName}
        onChange={(lastName) => setForm((current) => ({ ...current, lastName }))}
      />
      <Field
        label="University Email"
        placeholder="e.g. admin@university.edu"
        value={form.email}
        onChange={(email) => {
          setForm((current) => ({ ...current, email }));
          setEmailErrors((current) => ({ ...current, email: undefined }));
        }}
        onBlur={() =>
          setEmailErrors((current) => ({ ...current, email: emailError('email', form.email) }))
        }
        error={emailErrors.email}
        email
      />
      <Field
        label="Personal Email"
        placeholder="e.g. admin.personal@gmail.com"
        value={form.personalEmail}
        onChange={(personalEmail) => {
          setForm((current) => ({ ...current, personalEmail }));
          setEmailErrors((current) => ({ ...current, personalEmail: undefined }));
        }}
        onBlur={() =>
          setEmailErrors((current) => ({
            ...current,
            personalEmail: emailError('personalEmail', form.personalEmail),
          }))
        }
        error={emailErrors.personalEmail}
        email
      />
      <Field
        label="Phone Number (Optional)"
        placeholder="e.g. +233 24 000 0000"
        value={form.phone ?? ''}
        onChange={(phone) => setForm((current) => ({ ...current, phone }))}
        phone
      />
      <AppButton
        disabled={createAdmin.isPending}
        label={createAdmin.isPending ? 'Creating Administrator...' : 'Create Administrator'}
        onPress={submit}
      />
    </View>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  email,
  phone,
  error,
  onBlur,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  email?: boolean;
  phone?: boolean;
  error?: string;
  onBlur?: () => void;
}) {
  const p = usePalette();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: p.inkSoft }]}>{label}</Text>
      <TextInput
        autoCapitalize={email ? 'none' : 'words'}
        autoCorrect={false}
        keyboardType={email ? 'email-address' : phone ? 'phone-pad' : 'default'}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={p.muted}
        style={[styles.input, { borderColor: error ? p.error : p.hairline, color: p.ink }]}
        value={value}
      />
      {error ? <Text style={[styles.fieldError, { color: p.error }]}>{error}</Text> : null}
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
