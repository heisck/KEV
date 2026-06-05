import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackIcon } from '@/components/auth/AuthIcons';
import { AuthScaffold } from '@/screens/AuthScaffold';
import { LIMEADE } from '@/screens/authConfig';

const CODE_LENGTH = 6;

type VerificationCodeScreenProps = {
  onBack?: () => void;
  onConfirm?: (code: string) => void;
  onResend?: () => void;
  recipient?: string;
};

export function VerificationCodeScreen({
  onBack,
  onConfirm,
  onResend,
  recipient,
}: VerificationCodeScreenProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);
  const value = code.join('');

  const updateDigit = useCallback((index: number, text: string) => {
    const digits = text
      .replace(/\D/g, '')
      .slice(0, CODE_LENGTH - index)
      .split('');
    setCode((current) => {
      const next = [...current];
      if (digits.length === 0) next[index] = '';
      digits.forEach((digit, offset) => {
        next[index + offset] = digit;
      });
      return next;
    });
    if (digits.length > 0)
      inputs.current[Math.min(index + digits.length, CODE_LENGTH - 1)]?.focus();
  }, []);

  const handleConfirm = useCallback(() => onConfirm?.(value), [onConfirm, value]);

  return (
    <AuthScaffold heightRatio={0.46}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <BackIcon />
        </Pressable>
        <Text style={styles.title}>Verification code</Text>
      </View>

      <Text style={styles.subtitle}>
        We just sent a verification code to {recipient || 'your email'}. Enter it below.
      </Text>

      <View style={styles.codeRow}>
        {code.map((digit, index) => (
          <TextInput
            autoCorrect={false}
            disableFullscreenUI
            key={index}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            onBlur={() => setFocusedIndex(null)}
            onChangeText={(text) => updateDigit(index, text)}
            onFocus={() => setFocusedIndex(index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                inputs.current[index - 1]?.focus();
              }
            }}
            ref={(input) => {
              inputs.current[index] = input;
            }}
            returnKeyType="done"
            selectionColor="#091426"
            style={[styles.codeInput, focusedIndex === index && styles.codeInputFocused]}
            testID={`verification-code-digit-${index}`}
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            underlineColorAndroid="transparent"
            value={digit}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={value.length < CODE_LENGTH}
        onPress={handleConfirm}
        style={({ pressed }) => [
          styles.primaryButton,
          value.length < CODE_LENGTH && styles.disabledButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.primaryButtonText}>Confirm</Text>
      </Pressable>

      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Did not receive the code? </Text>
        <Pressable accessibilityRole="button" onPress={onResend}>
          <Text style={styles.resendAction}>Resend</Text>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', height: 46, justifyContent: 'center', marginBottom: 8 },
  backButton: {
    alignItems: 'center',
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    width: 46,
  },
  title: { color: '#1B1B1D', fontSize: 22, fontWeight: '700', lineHeight: 28 },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  codeRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 24 },
  codeInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    borderWidth: 1,
    color: '#1B1B1D',
    fontSize: 22,
    fontWeight: '700',
    height: 50,
    outlineColor: 'transparent',
    outlineWidth: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 44,
  },
  codeInputFocused: { borderColor: LIMEADE },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: LIMEADE,
    borderRadius: 27,
    elevation: 4,
    height: 52,
    justifyContent: 'center',
    shadowColor: LIMEADE,
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  disabledButton: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  resendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  resendText: { color: '#6B7280', fontSize: 14, lineHeight: 20 },
  resendAction: { color: LIMEADE, fontSize: 14, fontWeight: '700', lineHeight: 20 },
});
