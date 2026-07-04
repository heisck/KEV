import { useCallback, useState, type ReactNode } from 'react';
import { Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppleIcon, EmailIcon, GoogleIcon, LockIcon } from '@/components/auth/AuthIcons';
import { AuthScaffold } from '@/screens/AuthScaffold';
import { AUTH_OVERLAY_VERTICAL_PADDING } from '@/screens/authConfig';
import { authScreenStyles as styles } from '@/screens/authScreenStyles';

type AuthScreenProps = {
  onApplePress?: () => void;
  onGooglePress?: () => void;
  /** Email + password sign-in from this screen — accounts are pre-provisioned. */
  onEmailSignIn?: (email: string, password: string) => void;
  errorMessage?: string | null;
  isSubmitting?: boolean;
};

export function AuthScreen({
  onApplePress,
  onGooglePress,
  onEmailSignIn,
  errorMessage,
  isSubmitting = false,
}: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const { height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const layoutMinHeight = Math.max(height - top - bottom - AUTH_OVERLAY_VERTICAL_PADDING * 2, 0);
  const handleSignIn = useCallback(
    () => onEmailSignIn?.(email.trim(), password),
    [email, onEmailSignIn, password],
  );

  return (
    <AuthScaffold heightRatio={0.58} withPanel={false}>
      <View style={[styles.layout, { minHeight: layoutMinHeight }]}>
        <View style={styles.titleGroup}>
          <Text accessibilityLabel="Verify Account" style={styles.verifyTitle}>
            Verify <Text style={styles.accountTitle}>Account</Text>
          </Text>
        </View>

        <View style={styles.bottomGroup}>
          {errorMessage ? (
            <View style={styles.errorPill}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputShell}>
            <View pointerEvents="none" style={styles.inputIcon}>
              <EmailIcon />
            </View>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              disableFullscreenUI
              keyboardType="email-address"
              onBlur={() => setFocusedField(null)}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              placeholder="Write your gmail"
              placeholderTextColor="#9CA3AF"
              selectionColor="#091426"
              style={[styles.input, focusedField === 'email' && styles.inputFocused]}
              textContentType="emailAddress"
              underlineColorAndroid="transparent"
              value={email}
            />
          </View>

          <View style={styles.inputShell}>
            <View pointerEvents="none" style={styles.inputIcon}>
              <LockIcon />
            </View>
            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              disableFullscreenUI
              onBlur={() => setFocusedField(null)}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              placeholder="Your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              selectionColor="#091426"
              style={[styles.input, focusedField === 'password' && styles.inputFocused]}
              textContentType="password"
              underlineColorAndroid="transparent"
              value={password}
            />
          </View>

          <View style={styles.actionRow}>
            <SocialButton icon={<GoogleIcon size={22} />} label="Google" onPress={onGooglePress} />
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleSignIn}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                isSubmitting && styles.disabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </Text>
            </Pressable>
            <SocialButton
              icon={<AppleIcon size={20} />}
              label="Apple"
              onPress={onApplePress}
              variant="dark"
            />
          </View>
        </View>
      </View>
    </AuthScaffold>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
  variant = 'light',
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  variant?: 'dark' | 'light';
}) {
  const isDark = variant === 'dark';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        isDark && styles.darkSocialButton,
        pressed && styles.pressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}
