import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenTopBar } from '@/components/kev/chrome';
import { LockIcon, PencilIcon } from '@/components/kev/icons';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { colors, radii, spacing } from '@/theme';

const CODE_LENGTH = 5;

/** Code verification — dashed lock badge, five code boxes, resend + submit. */
export function CodeVerificationScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { contact } = useLocalSearchParams<{ contact?: string }>();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const complete = code.length === CODE_LENGTH;

  return (
    <View style={[styles.screen, { paddingTop: top + spacing.md }]}>
      <ScreenTopBar title="Verification" onBack={() => router.back()} />

      <View style={styles.body}>
        <View style={styles.dashRing}>
          <View style={styles.lockBadge}>
            <LockIcon color={colors.white} size={30} />
          </View>
        </View>

        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.sub}>We sent a verification code to{'\n'}your registered contact.</Text>

        <HapticPressable
          accessibilityRole="button"
          accessibilityLabel="Enter verification code"
          onPress={() => inputRef.current?.focus()}
          style={styles.boxes}
        >
          {Array.from({ length: CODE_LENGTH }, (_, i) => {
            const digit = code[i];
            return (
              <View key={i} style={[styles.box, digit ? styles.boxFilled : null]}>
                <Text style={styles.boxDigit}>{digit ?? ''}</Text>
              </View>
            );
          })}
        </HapticPressable>
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          autoFocus
          style={styles.hiddenInput}
          testID="verify-code-input"
        />

        <View style={styles.contactRow}>
          <Text style={styles.contact}>{contact ?? 'your account contact'}</Text>
          <HapticPressable
            accessibilityRole="button"
            accessibilityLabel="Edit contact"
            onPress={() => router.back()}
            style={styles.editButton}
          >
            <PencilIcon color={colors.inkSoft} />
          </HapticPressable>
        </View>
      </View>

      <View style={styles.footer}>
        <HapticPressable
          accessibilityRole="button"
          onPress={() => setCode('')}
          style={styles.resend}
          testID="verify-code-resend"
        >
          <Text style={styles.resendText}>Send Again</Text>
        </HapticPressable>
        <HapticPressable
          accessibilityRole="button"
          disabled={!complete}
          onPress={() => router.back()}
          style={[styles.submit, !complete && styles.submitDisabled]}
          testID="verify-code-submit"
        >
          <Text style={styles.submitText}>Submit</Text>
        </HapticPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.white,
    flex: 1,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  body: { alignItems: 'center', flex: 1, paddingTop: spacing.xxxl },
  dashRing: {
    alignItems: 'center',
    borderColor: colors.mintDeep,
    borderRadius: radii.pill,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 148,
    justifyContent: 'center',
    width: 148,
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryDeep,
    borderRadius: radii.pill,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800', marginTop: spacing.xxl },
  sub: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  boxes: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl },
  box: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: radii.sm,
    height: 52,
    justifyContent: 'center',
    width: 46,
  },
  boxFilled: {
    backgroundColor: colors.white,
    borderColor: colors.primaryDeep,
    borderWidth: 1.5,
  },
  boxDigit: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  hiddenInput: { height: 1, opacity: 0, position: 'absolute', width: 1 },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  contact: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  editButton: {
    alignItems: 'center',
    borderColor: colors.hairline,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  footer: { gap: spacing.md },
  resend: {
    alignItems: 'center',
    borderColor: colors.hairline,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingVertical: spacing.lg - 2,
  },
  resendText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.primaryDeep,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg - 2,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
