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
    <AuthScaffold heightRatio={0.58}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify your Account</Text>
        <Text style={styles.subtitle}>
          Fill in your information below or register with your social account
        </Text>
      </View>

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

      <Pressable
        accessibilityRole="button"
        onPress={handleSendCode}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>Send Code</Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <SocialButton icon={<GoogleIcon />} label="Google" onPress={onGooglePress} />
        <SocialButton icon={<AppleIcon />} label="Apple" onPress={onApplePress} variant="dark" />
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
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        isDark && styles.darkSocialButton,
        pressed && styles.pressed,
      ]}
    >
      {icon}
      <Text style={[styles.socialButtonText, isDark && styles.darkSocialButtonText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 24 },
  title: { color: '#1B1B1D', fontSize: 24, fontWeight: '700', lineHeight: 30, textAlign: 'center' },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 300,
    textAlign: 'center',
  },
  inputShell: { marginBottom: 16 },
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
    height: 52,
    justifyContent: 'center',
    shadowColor: LIMEADE,
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  divider: { alignItems: 'center', flexDirection: 'row', gap: 16, marginVertical: 24 },
  dividerLine: { backgroundColor: '#D1D5DB', flex: 1, height: 1 },
  dividerText: { color: '#9CA3AF', fontSize: 12, textTransform: 'uppercase' },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
    borderRadius: 29,
    borderWidth: 1,
    elevation: 2,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 46,
    justifyContent: 'center',
    minWidth: 0,
  },
  darkSocialButton: { backgroundColor: '#000000', borderColor: '#000000' },
  socialButtonText: { color: '#1B1B1D', fontSize: 15, fontWeight: '700' },
  darkSocialButtonText: { color: '#FFFFFF' },
});
