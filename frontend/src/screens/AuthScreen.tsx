import { useCallback, useState } from 'react';
import { Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmailIcon, EyeIcon, EyeOffIcon, LockIcon } from '@/components/auth/AuthIcons';
import { GlassPressable } from '@/components/ui/GlassPressable';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { AuthScaffold } from '@/screens/AuthScaffold';
import { AUTH_OVERLAY_VERTICAL_PADDING } from '@/screens/authConfig';
import { authScreenStyles as styles } from '@/screens/authScreenStyles';
import { usePalette } from '@/theme';

type AuthScreenProps = {
  /** Email + password sign-in from this screen — accounts are pre-provisioned. */
  onEmailSignIn?: (email: string, password: string) => void;
  isSubmitting?: boolean;
};

/** Email/password sign-in surface. Keyboard avoidance is handled by AuthScaffold. */
export function AuthScreen({ onEmailSignIn, isSubmitting = false }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const { height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const palette = usePalette();

  // Static column height; the scaffold's KeyboardAvoidingView lifts the inputs above
  // the keyboard, so no per-keystroke keyboard-height math is needed here.
  const fullMinHeight = Math.max(height - top - bottom - AUTH_OVERLAY_VERTICAL_PADDING * 2, 0);
  const layoutMinHeight = Math.max(fullMinHeight, 300);

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
              onBlur={() => setFocusedField(null)}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              placeholder="Write your gmail"
              placeholderTextColor={palette.muted}
              selectionColor={palette.ink}
              style={[
                styles.input,
                { color: palette.ink },
                focusedField === 'email' && styles.inputFocused,
              ]}
              textContentType="emailAddress"
              underlineColorAndroid="transparent"
              value={email}
            />
          </GlassSurface>

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
            <DecorCircle tint={palette.primary} />
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
            <DecorCircle tint={palette.pink} />
          </View>
        </View>
      </View>
    </AuthScaffold>
  );
}

/**
 * Purely decorative glass disc flanking the sign-in button. Accounts are provisioned
 * by an admin, so there is no social sign-in — these keep the row's symmetry where
 * the Google/Apple buttons used to sit. Hidden from screen readers by design.
 */
function DecorCircle({ tint }: { tint: string }) {
  const palette = usePalette();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.decorWrap}
    >
      <GlassSurface
        fallbackColor={palette.surface}
        glassEffectStyle="clear"
        intensity={60}
        style={styles.decorCircle}
        tintColor={palette.surface}
      >
        <View style={[styles.decorRing, { borderColor: tint }]} />
        <View style={[styles.decorDot, { backgroundColor: tint }]} />
      </GlassSurface>
    </View>
  );
}
