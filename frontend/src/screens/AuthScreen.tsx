import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Keyboard, Platform, Text, TextInput, useWindowDimensions, View } from 'react-native';
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
import { AUTH_OVERLAY_VERTICAL_PADDING, LIMEADE } from '@/screens/authConfig';
import { authScreenStyles as styles } from '@/screens/authScreenStyles';

type AuthScreenProps = {
  onApplePress?: () => void;
  onGooglePress?: () => void;
  /** Email + password sign-in from this screen — accounts are pre-provisioned. */
  onEmailSignIn?: (email: string, password: string) => void;
  isSubmitting?: boolean;
};

/** Tracks the soft-keyboard height so the layout can compress instead of scrolling. */
function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return keyboardHeight;
}

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
  const { height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  // Compress the column when the keyboard shows (iOS) so the inputs lift to sit
  // above it. The title is anchored by the scaffold and is unaffected.
  const fullMinHeight = Math.max(height - top - bottom - AUTH_OVERLAY_VERTICAL_PADDING * 2, 0);
  const keyboardAdjusted = Platform.OS === 'ios' ? fullMinHeight - keyboardHeight : fullMinHeight;
  const layoutMinHeight = Math.max(keyboardAdjusted, 300);

  const handleSignIn = useCallback(
    () => onEmailSignIn?.(email.trim(), password),
    [email, onEmailSignIn, password],
  );

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
          <GlassSurface fallbackColor="#FFFFFF" intensity={60} style={styles.inputShell}>
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
          </GlassSurface>

          <GlassSurface fallbackColor="#FFFFFF" intensity={60} style={styles.inputShell}>
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
              secureTextEntry={!isPasswordVisible}
              selectionColor="#091426"
              style={[
                styles.input,
                styles.passwordInput,
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
              tintColor={LIMEADE}
            >
              <Text style={styles.primaryButtonText}>
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

  return (
    <GlassPressable
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.socialWrap}
      surfaceStyle={styles.socialButton}
      tintColor={isDark ? '#000000' : '#FFFFFF'}
      glassEffectStyle={isDark ? 'regular' : 'clear'}
    >
      {icon}
    </GlassPressable>
  );
}
