import { useEffect, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lookupStudent } from '@/api/directory';
import { ScreenTopBar } from '@/components/kev/chrome';
import { FaceIdIcon, NfcIcon } from '@/components/kev/icons';
import { ScanMethodSwitcher, type ScanMethod } from '@/components/scan/ScanMethodSwitcher';
import { SessionLockButton } from '@/components/scan/SessionLockButton';
import { AppButton } from '@/components/ui/AppButton';
import { HapticPressable } from '@/components/ui/HapticPressable';
import { studentRecordToScanned } from '@/data/exams';
import { useNfcScan } from '@/hooks/useNfcScan';
import { useScanCheckIn } from '@/hooks/useScanCheckIn';
import { useScanMethodGuard } from '@/hooks/useScanMethodGuard';
import { useScanNavigation } from '@/hooks/useScanNavigation';
import { useScanSessionId } from '@/hooks/useScanSession';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, shadows, spacing, usePalette } from '@/theme';

function CameraFlipIcon({ color }: { color: string }) {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Circle cx={12} cy={12} fill="none" r={9} stroke={color} strokeWidth={1.7} />
      <Path
        d="M7 10a5.5 5.5 0 0 1 9-2l1.5 1.5M17 14a5.5 5.5 0 0 1-9 2l-1.5-1.5M17.5 6.5v3h-3M6.5 17.5v-3h3"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
      />
    </Svg>
  );
}

const TITLE_BY_MODE: Record<ScanMethod, string> = {
  FACE: 'Face verification',
  NFC: 'NFC scan',
  MANUAL: 'Manual entry',
};

export function ScanVerificationScreen({ initialMode = 'FACE' }: { initialMode?: ScanMethod }) {
  const p = usePalette();
  const { height } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const sessionId = useScanSessionId();
  const { goBack } = useScanNavigation(sessionId);
  const [mode, setMode] = useState<ScanMethod>(initialMode);

  // Scan methods guard
  const completeFaceScan = useScanCheckIn(sessionId, 'FACE');
  const completeNfcScan = useScanCheckIn(sessionId, 'NFC');
  const completeManualScan = useScanCheckIn(sessionId, 'MANUAL');
  const { allowedMethods, canUse: canUseMode } = useScanMethodGuard(sessionId, mode);

  // Camera state
  const [permission, requestPermission] = useCameraPermissions();
  const facing = useSettingsStore((s) => s.cameraFacing);
  const setFacing = useSettingsStore((s) => s.setCameraFacing);
  const previewHeight = Math.min(Math.max(height * 0.44, 280), 480);

  // NFC state
  const handleNfcIndexNumber = async (idx: string) => {
    try {
      const student = await lookupStudent(idx);
      await completeNfcScan(studentRecordToScanned(student));
    } catch {
      await completeNfcScan();
    }
  };
  const nfc = useNfcScan({ onIndexNumber: handleNfcIndexNumber });
  const drift = useSharedValue(0);

  useEffect(() => {
    if (mode !== 'NFC' || !canUseMode) return undefined;
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    nfc.start();
    return () => nfc.cancel();
  }, [canUseMode, drift, mode, nfc]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * -84 }, { rotate: `${-8 + drift.value * 8}deg` }],
  }));
  const wavesStyle = useAnimatedStyle(() => ({ opacity: 0.25 + drift.value * 0.75 }));

  // Manual state
  const [manualIndex, setManualIndex] = useState('');
  const [manualNotFound, setManualNotFound] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const submitManual = async () => {
    if (!canUseMode || !manualIndex.trim() || manualSubmitting) return;
    setManualSubmitting(true);
    try {
      const student = await lookupStudent(manualIndex.trim());
      await completeManualScan(studentRecordToScanned(student));
    } catch {
      setManualNotFound(true);
    } finally {
      setManualSubmitting(false);
    }
  };

  const bottomPadding = Math.max(bottom, 20);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={[
          styles.screen,
          {
            backgroundColor: p.bg,
            paddingBottom: bottomPadding,
            paddingTop: top + spacing.md,
          },
        ]}
      >
        <ScreenTopBar
          title={TITLE_BY_MODE[mode]}
          onBack={goBack}
          trailing={<SessionLockButton sessionId={sessionId} />}
        />

        {/* Dynamic Center Stage */}
        <View style={styles.stage}>
          {mode === 'FACE' ? (
            <View style={styles.faceStage}>
              <View style={[styles.preview, { borderColor: p.primary20, height: previewHeight }]}>
                {permission?.granted ? (
                  <CameraView facing={facing} style={StyleSheet.absoluteFill} />
                ) : (
                  <View style={[styles.facePlaceholder, { backgroundColor: p.surfaceDim }]}>
                    <FaceIdIcon color={p.muted} size={44} />
                  </View>
                )}
                {permission?.granted ? (
                  <HapticPressable
                    accessibilityLabel="Switch camera"
                    accessibilityRole="button"
                    haptic="select"
                    onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
                    style={[styles.switchButton, { backgroundColor: p.surface }]}
                  >
                    <CameraFlipIcon color={p.ink} />
                  </HapticPressable>
                ) : null}
              </View>
              <Text style={[styles.title, { color: p.ink }]}>Align the student&apos;s face</Text>
              <Text style={[styles.sub, { color: p.muted }]}>
                Center the face in the circle, then capture.
              </Text>
            </View>
          ) : mode === 'NFC' ? (
            <View style={styles.nfcStage}>
              <View style={styles.nfcGraphic}>
                <View
                  style={[styles.phone, { backgroundColor: p.surfaceDim, borderColor: p.hairline }]}
                >
                  <View style={[styles.phoneNotch, { backgroundColor: p.hairline }]} />
                  <Animated.View style={wavesStyle}>
                    <NfcIcon color={p.primary} size={34} />
                  </Animated.View>
                </View>

                <Animated.View style={[styles.card, { backgroundColor: p.primary }, cardStyle]}>
                  <View style={[styles.cardChip, { backgroundColor: p.warn }]} />
                  <NfcIcon color={p.onPrimary} size={20} />
                  <Text style={[styles.cardText, { color: p.onPrimary }]}>Student ID</Text>
                </Animated.View>
              </View>

              <View style={styles.copy}>
                <Text style={[styles.title, { color: p.ink }]}>Hold the card near the phone</Text>
                <Text style={[styles.sub, { color: p.muted }]}>
                  {nfc.error === 'unsupported'
                    ? 'NFC hardware unavailable on simulator'
                    : 'Keep the student ID steady until it reads.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.manualStage}>
              <Text style={[styles.label, { color: p.ink }]}>Index number</Text>
              <TextInput
                value={manualIndex}
                onChangeText={(t) => {
                  setManualIndex(t);
                  setManualNotFound(false);
                }}
                placeholder="e.g. 4211020"
                placeholderTextColor={p.muted}
                keyboardType="number-pad"
                autoFocus
                style={[
                  styles.input,
                  { backgroundColor: p.surfaceDim, borderColor: p.hairline, color: p.ink },
                  manualNotFound && { borderColor: p.error },
                ]}
                testID="manual-index"
              />
              {manualNotFound ? (
                <Text style={[styles.errorText, { color: p.error }]}>
                  Student not found. Check the index number and try again.
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Fixed Position Dock — 20px from Bottom */}
        <View style={styles.bottomDock}>
          <ScanMethodSwitcher
            active={mode}
            sessionId={sessionId}
            allowedMethods={allowedMethods}
            onSelectMethod={(m) => {
              Keyboard.dismiss();
              setMode(m);
            }}
          />

          {mode === 'FACE' ? (
            permission?.granted ? (
              <HapticPressable
                accessibilityRole="button"
                disabled={!canUseMode}
                onPress={() => void completeFaceScan()}
                style={[styles.cta, { backgroundColor: p.primary }, !canUseMode && styles.disabled]}
                testID="face-capture"
              >
                <Text style={[styles.ctaText, { color: p.onPrimary }]}>Capture</Text>
              </HapticPressable>
            ) : (
              <HapticPressable
                accessibilityRole="button"
                disabled={!canUseMode}
                onPress={() => void requestPermission()}
                style={[styles.cta, { backgroundColor: p.primary }, !canUseMode && styles.disabled]}
                testID="face-permission"
              >
                <Text style={[styles.ctaText, { color: p.onPrimary }]}>Allow camera</Text>
              </HapticPressable>
            )
          ) : mode === 'NFC' ? (
            nfc.error === 'unsupported' ? (
              <AppButton
                label="Simulate NFC Tag"
                variant="ghost"
                onPress={() => void completeNfcScan()}
                testID="nfc-simulate-tag"
              />
            ) : null
          ) : (
            <HapticPressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: !canUseMode || manualSubmitting || !manualIndex.trim(),
              }}
              disabled={!canUseMode || manualSubmitting || !manualIndex.trim()}
              haptic="select"
              onPress={submitManual}
              style={[
                styles.cta,
                { backgroundColor: p.primary },
                (!canUseMode || manualSubmitting || !manualIndex.trim()) && styles.disabled,
              ]}
              testID="manual-send"
            >
              <Text style={[styles.ctaText, { color: p.onPrimary }]}>
                {manualSubmitting ? 'Sending…' : 'Send'}
              </Text>
            </HapticPressable>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: spacing.xl },
  stage: { alignItems: 'stretch', flex: 1, justifyContent: 'center' },

  // Face Stage
  faceStage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  preview: {
    alignSelf: 'stretch',
    borderRadius: radii.xl,
    borderWidth: 3,
    overflow: 'hidden',
  },
  facePlaceholder: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', marginTop: spacing.lg, textAlign: 'center' },
  sub: { fontSize: 13, fontWeight: '500', marginTop: 4, textAlign: 'center' },
  switchButton: {
    alignItems: 'center',
    bottom: spacing.md,
    borderRadius: radii.pill,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    width: 50,
  },

  // NFC Stage
  nfcStage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  nfcGraphic: { alignItems: 'center', justifyContent: 'center' },
  phone: {
    alignItems: 'center',
    borderRadius: radii.xl,
    borderWidth: 2,
    height: 224,
    justifyContent: 'center',
    width: 124,
  },
  phoneNotch: {
    borderRadius: radii.pill,
    height: 5,
    position: 'absolute',
    top: 10,
    width: 40,
  },
  card: {
    alignItems: 'flex-start',
    borderRadius: radii.md,
    gap: 6,
    height: 74,
    justifyContent: 'flex-end',
    marginTop: spacing.xxl,
    padding: spacing.md,
    width: 118,
    ...shadows.floating,
  },
  cardChip: {
    borderRadius: 3,
    height: 12,
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 16,
  },
  cardText: { fontSize: 11, fontWeight: '700' },
  copy: { alignItems: 'center', gap: 4, paddingTop: spacing.xl },

  // Manual Stage
  manualStage: { flex: 1, gap: spacing.md, paddingTop: spacing.xxl },
  label: { fontSize: 14, fontWeight: '700' },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    fontSize: 18,
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg - 2,
  },
  errorText: { fontSize: 12, fontWeight: '600' },

  // Bottom Dock - Fixed 20px from Bottom
  bottomDock: {
    gap: spacing.md,
    marginTop: 'auto',
  },
  cta: {
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingVertical: spacing.lg - 2,
  },
  ctaText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
