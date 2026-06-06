import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FaceRecognitionPreview } from '@/components/nfc/FaceRecognitionPreview';
import { InfoIcon } from '@/components/nfc/NfcIcons';
import { NfcScanVisual } from '@/components/nfc/NfcScanVisual';
import { ManualEntryDrawer } from '@/components/nfc/ManualEntryDrawer';
import { RoomIcon } from '@/components/room/RoomSetupControls';
import { SystemStatusBar } from '@/components/SystemStatusBar';
import { nfcVerificationStyles as styles } from '@/screens/nfcVerificationStyles';
import { useSlideUpPanel } from '@/hooks/useSlideUpPanel';

type NfcVerificationScreenProps = {
  onClose?: () => void;
  onFaceCapture?: () => void;
  onManualSubmit?: (studentId: string) => void;
  onNfcScan?: () => void;
  roomCode?: string;
};

export function NfcVerificationScreen({
  onClose,
  onFaceCapture,
  onManualSubmit,
  onNfcScan,
  roomCode = '482913',
}: NfcVerificationScreenProps) {
  const { bottom, top } = useSafeAreaInsets();
  const [isFaceOpen, setIsFaceOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const manualDrawer = useSlideUpPanel(320);

  if (isFaceOpen) {
    return <FaceRecognitionPreview onClose={() => setIsFaceOpen(false)} onSubmit={onFaceCapture} />;
  }

  return (
    <View style={styles.screen}>
      <SystemStatusBar backgroundColor="#F2F3FF" barStyle="dark-content" />
      <View style={[styles.nav, { paddingTop: Math.max(top, 14) }]}>
        <Pressable
          accessibilityLabel="Close NFC verification"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.navButton}
        >
          <RoomIcon color="#131B2E" name="close" size={18} strokeWidth={2.3} />
        </Pressable>
        <Text style={styles.brandTitle}>Verification</Text>
        <View style={styles.navSpacer} />
      </View>

      <View style={[styles.content, { paddingBottom: bottom + 28, paddingTop: top + 82 }]}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Secure identification using your KNUST ID card.</Text>
          <View style={styles.roomCodeCard}>
            <Text style={styles.roomCodeLabel}>Created room ID</Text>
            <Text selectable style={styles.roomCodeText}>
              {roomCode}
            </Text>
          </View>
        </View>

        <NfcScanVisual onScanComplete={onNfcScan} />

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <InfoIcon color="#8A9382" />
            <Text style={styles.infoText}>Keep card still until scan is complete</Text>
          </View>
          <View style={styles.actionRow}>
            <Pressable
              accessibilityLabel="Manual entry"
              accessibilityRole="button"
              onPress={manualDrawer.show}
              style={({ pressed }) => [styles.manualButton, pressed && styles.manualButtonPressed]}
            >
              <Text style={styles.manualText}>MANUAL ENTRY</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Use face recognition"
              accessibilityRole="button"
              onPress={() => setIsFaceOpen(true)}
              style={({ pressed }) => [styles.faceButton, pressed && styles.manualButtonPressed]}
            >
              <Text style={styles.faceText}>FACE RECOGNITION</Text>
            </Pressable>
          </View>
          <Text style={styles.poweredText}>Powered by KEV Academic Identity Services</Text>
        </View>
      </View>
      {manualDrawer.isVisible ? (
        <ManualEntryDrawer
          bottomInset={bottom}
          onChangeStudentId={setStudentId}
          onClose={manualDrawer.hide}
          onSubmit={() => onManualSubmit?.(studentId.trim())}
          studentId={studentId}
          translateY={manualDrawer.translateY}
        />
      ) : null}
    </View>
  );
}
