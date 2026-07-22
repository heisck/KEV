import { useCallback, useState, type ReactNode } from 'react';
import { Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppleIcon,
  EmailIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
} from '@/components/auth/AuthIcons';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { AuthScaffold } from '@/screens/AuthScaffold';
import { AUTH_OVERLAY_VERTICAL_PADDING } from '@/screens/authConfig';
import { authScreenStyles as styles } from '@/screens/authScreenStyles';
import { usePalette } from '@/theme';

type AuthScreenProps = {
  onApplePress?: () => void;
  onGooglePress?: () => void;
  /** Email + password sign-in from this screen — accounts are pre-provisioned. */
  onEmailSignIn?: (email: string, password: string) => void;
  isSubmitting?: boolean;
};

/** Email/password sign-in surface. Keyboard avoidance is handled by AuthScaffold. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthScreen({
  onApplePress,
  onGooglePress,
  onEmailSignIn,
  isSubmitting = false,
}: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  const { height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const palette = usePalette();

  const fullMinHeight = Math.max(height - top - bottom - AUTH_OVERLAY_VERTICAL_PADDING * 2, 0);
  const layoutMinHeight = Math.max(fullMinHeight, 300);

  const validateEmail = useCallback((val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Email is required';
    if (!EMAIL_REGEX.test(trimmed)) return 'Incorrect email address';
    return null;
  }, []);

  const handleEmailBlur = useCallback(() => {
    setFocusedField(null);
    setIsEmailTouched(true);
    setEmailError(validateEmail(email));
  }, [email, validateEmail]);

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (isEmailTouched) {
        setEmailError(validateEmail(text));
      }
    },
    [isEmailTouched, validateEmail],
  );

  const handleSignIn = useCallback(() => {
    const err = validateEmail(email);
    setIsEmailTouched(true);
    setEmailError(err);
    if (!err) {
      onEmailSignIn?.(email.trim(), password);
    }
  }, [email, onEmailSignIn, password, validateEmail]);

  return (
    <AuthScaffold
      heightRatio={0.58}
      withPanel={false}
      overlayTitle={
        <Text accessibilityLabel="Verify Account" style={styles.verifyTitle}>
          Verify <Text style={styles.accountTitle}>Account</Text>
        </Text>
      }
    >
      <View style={[styles.layout, { minHeight: layoutMinHeight }]}>
        <View style={styles.bottomGroup}>
          <GlassSurface fallbackColor={palette.input} intensity={60} style={styles.inputShell}>
            <View pointerEvents="none" style={styles.inputIcon}>
              <EmailIcon />
            </View>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              disableFullscreenUI
              keyboardType="email-address"
              onBlur={handleEmailBlur}
              onChangeText={handleEmailChange}
              onFocus={() => setFocusedField('email')}
              placeholder="Write your gmail"
              placeholderTextColor={palette.muted}
              selectionColor={palette.ink}
              style={[
                styles.input,
                { color: palette.ink },
                focusedField === 'email' && styles.inputFocused,
                Boolean(emailError) && isEmailTouched && styles.inputError,
              ]}
              textContentType="emailAddress"
              underlineColorAndroid="transparent"
              value={email}
            />
          </GlassSurface>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { opacity: emailError && isEmailTouched ? 1 : 0 }]}>
              {emailError ?? ' '}
            </Text>
          </View>

          <GlassSurface fallbackColor={palette.input} intensity={60} style={styles.inputShell}>
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
              placeholderTextColor={palette.muted}
              secureTextEntry={!isPasswordVisible}
              selectionColor={palette.ink}
              style={[
                styles.input,
                styles.passwordInput,
                { color: palette.ink },
                focusedField === 'password' && styles.inputFocused,
              ]}
              textContentType="password"
              underlineColorAndroid="transparent"
              value={password}
            />
            <HapticPressable
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
              accessibilityRole="button"
              haptic="select"
              hitSlop={10}
              onPress={() => setIsPasswordVisible((v) => !v)}
              style={styles.eyeToggle}
            >
              {isPasswordVisible ? <EyeOffIcon size={22} /> : <EyeIcon size={22} />}
            </HapticPressable>
          </GlassSurface>

          <View style={styles.actionRow}>
            <SocialButton icon={<GoogleIcon size={22} />} label="Google" onPress={onGooglePress} />
            <GlassPressable
              disabled={isSubmitting}
              onPress={handleSignIn}
              style={styles.primaryButtonWrap}
              surfaceStyle={styles.primaryButton}
              tintColor={palette.primary}
            >
              <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </Text>
            </GlassPressable>
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
  const palette = usePalette();

  return (
    <GlassPressable
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.socialWrap}
      surfaceStyle={styles.socialButton}
      tintColor={isDark ? '#000000' : palette.surface}
      glassEffectStyle={isDark ? 'regular' : 'clear'}
    >
      {icon}
    </GlassPressable>
  );
}
