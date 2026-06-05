import { useCallback, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppleIcon, EmailIcon, GoogleIcon } from '@/components/auth/AuthIcons';
import { AuthScaffold } from '@/screens/AuthScaffold';
import { LIMEADE } from '@/screens/authConfig';

type AuthScreenProps = {
  onApplePress?: () => void;
  onGooglePress?: () => void;
  onSendCode?: (email: string) => void;
};

export function AuthScreen({ onApplePress, onGooglePress, onSendCode }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const handleSendCode = useCallback(() => onSendCode?.(email.trim()), [email, onSendCode]);

  return (
    <AuthScaffold heightRatio={0.58} withPanel={false}>
      <View style={styles.layout}>
        <View style={styles.titleGroup}>
          <Text accessibilityLabel="Verify Account" style={styles.verifyTitle}>
            Verify <Text style={styles.accountTitle}>Account</Text>
          </Text>
        </View>

        <View style={styles.bottomGroup}>
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
              onBlur={() => setIsEmailFocused(false)}
              onChangeText={setEmail}
              onFocus={() => setIsEmailFocused(true)}
              placeholder="Write your gmail"
              placeholderTextColor="#9CA3AF"
              selectionColor="#091426"
              style={[styles.input, isEmailFocused && styles.inputFocused]}
              textContentType="emailAddress"
              underlineColorAndroid="transparent"
              value={email}
            />
          </View>

          <View style={styles.actionRow}>
            <SocialButton icon={<GoogleIcon size={22} />} label="Google" onPress={onGooglePress} />
            <Pressable
              accessibilityRole="button"
              onPress={handleSendCode}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Send Code</Text>
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

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'space-between', minHeight: 680 },
  bottomGroup: { alignSelf: 'center', gap: 14, maxWidth: 318, width: '100%' },
  titleGroup: { alignItems: 'center' },
  verifyTitle: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '100',
    lineHeight: 48,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.22)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 5,
  },
  accountTitle: { fontSize: 34, fontWeight: '600', lineHeight: 40 },
  inputShell: { width: '100%' },
  inputIcon: { height: 50, justifyContent: 'center', left: 20, position: 'absolute', zIndex: 1 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
    borderRadius: 29,
    borderWidth: 1,
    color: '#1B1B1D',
    elevation: 2,
    fontSize: 16,
    height: 50,
    outlineColor: 'transparent',
    outlineWidth: 0,
    paddingLeft: 54,
    paddingRight: 24,
    shadowColor: '#111111',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  inputFocused: { borderColor: LIMEADE },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: LIMEADE,
    borderRadius: 29,
    elevation: 4,
    flex: 1,
    height: 52,
    justifyContent: 'center',
    maxWidth: 190,
    shadowColor: LIMEADE,
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
    borderRadius: 26,
    borderWidth: 1,
    elevation: 2,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  darkSocialButton: { backgroundColor: '#000000', borderColor: '#000000' },
});
