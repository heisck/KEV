import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { z } from 'zod';

import { getProblemDetail } from '@/api/schemas';
import { AppButton } from '@/components/ui';
import { loginStyles as styles } from '@/screens/loginStyles';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

type LoginScreenProps = { initialEmail?: string };

/**
 * Email + password sign-in. Accounts are pre-provisioned (lecturers/admins) —
 * there is no self-registration, so this screen only ever signs in.
 */
export function LoginScreen({ initialEmail = '' }: LoginScreenProps) {
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const [problem, setProblem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: initialEmail, password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setProblem(null);
    setIsSubmitting(true);
    try {
      await signInWithPassword(email, password);
      // Success flips authStore status; the (auth) layout redirects to the tabs.
    } catch (error: unknown) {
      const detail = getProblemDetail(error);
      setProblem(detail?.detail ?? detail?.title ?? 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.sheet}>
          <Text style={styles.heading}>
            Verify your{'\n'}
            <Text style={styles.headingAccent}>account.</Text>
          </Text>
          <Text style={styles.subheading}>
            Sign in with the account your institution provisioned for you.
          </Text>

          {problem ? (
            <View style={styles.problem}>
              <Text style={styles.problemText}>{problem}</Text>
            </View>
          ) : null}

          <Field
            control={control}
            name="email"
            label="Email"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Field
            control={control}
            name="password"
            label="Password"
            autoComplete="password"
            secureTextEntry
          />

          <AppButton
            label={isSubmitting ? 'Please wait…' : 'Sign in'}
            onPress={() => void onSubmit()}
            disabled={isSubmitting}
            testID="login-submit"
          />
          <Text style={styles.switchText}>
            No account? Ask your exams administrator to add you.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  control,
  name,
  label,
  autoComplete,
  keyboardType,
  secureTextEntry,
}: {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
  autoComplete?: 'email' | 'password';
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <View style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete={autoComplete}
            autoCorrect={false}
            keyboardType={keyboardType}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={label}
            placeholderTextColor={colors.muted}
            secureTextEntry={secureTextEntry}
            style={[styles.input, error && styles.inputError]}
            value={value}
          />
          {error ? <Text style={styles.fieldError}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}
