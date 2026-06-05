import { useCallback, useState, type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppleIcon, EmailIcon, GoogleIcon } from '@/components/auth/AuthIcons';

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?auto=format&fit=crop&w=1200&q=80';

type AuthScreenProps = {
  onApplePress?: () => void;
  onGooglePress?: () => void;
  onSendCode?: (email: string) => void;
};

export function AuthScreen({ onApplePress, onGooglePress, onSendCode }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const handleSendCode = useCallback(() => onSendCode?.(email.trim()), [email, onSendCode]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{ uri: HERO_IMAGE_URL }}
        style={styles.hero}
      />
      <SafeAreaView edges={['bottom']} style={styles.content}>
        <View style={styles.panel}>
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
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Write your gmail"
              placeholderTextColor="#9CA3AF"
              selectionColor="#091426"
              style={styles.input}
              textContentType="emailAddress"
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
            <SocialButton
              icon={<AppleIcon />}
              label="Apple"
              onPress={onApplePress}
              variant="dark"
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  screen: { backgroundColor: '#111111', flex: 1 },
  hero: {
    bottom: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  content: { flex: 1, justifyContent: 'flex-end' },
  panel: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    elevation: 10,
    maxWidth: 448,
    minHeight: '55%',
    paddingBottom: 44,
    paddingHorizontal: 32,
    paddingTop: 48,
    shadowColor: '#111111',
    shadowOffset: { height: -6, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    width: '100%',
  },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { color: '#1B1B1D', fontSize: 28, fontWeight: '700', lineHeight: 34, textAlign: 'center' },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 300,
    textAlign: 'center',
  },
  inputShell: { marginBottom: 20 },
  inputIcon: { height: 58, justifyContent: 'center', left: 22, position: 'absolute', zIndex: 1 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
    borderRadius: 29,
    borderWidth: 1,
    color: '#1B1B1D',
    elevation: 2,
    fontSize: 15,
    height: 58,
    paddingLeft: 56,
    paddingRight: 24,
    shadowColor: '#111111',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#5C9E08',
    borderRadius: 29,
    elevation: 4,
    height: 58,
    justifyContent: 'center',
    shadowColor: '#5C9E08',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  divider: { alignItems: 'center', flexDirection: 'row', gap: 16, marginVertical: 32 },
  dividerLine: { backgroundColor: '#D1D5DB', flex: 1, height: 1 },
  dividerText: { color: '#9CA3AF', fontSize: 12, textTransform: 'uppercase' },
  socialRow: { flexDirection: 'row', gap: 16 },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
    borderRadius: 29,
    borderWidth: 1,
    elevation: 2,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 58,
    justifyContent: 'center',
  },
  darkSocialButton: { backgroundColor: '#000000', borderColor: '#000000' },
  socialButtonText: { color: '#1B1B1D', fontSize: 15, fontWeight: '700' },
  darkSocialButtonText: { color: '#FFFFFF' },
});
