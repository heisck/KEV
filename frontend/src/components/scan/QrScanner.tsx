import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton, Card, GlassSurface } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

const SCAN_DEBOUNCE_MS = 2000;

type QrScannerProps = {
  /** Fires at most once per debounce window with the decoded value. */
  onCode: (value: string) => void;
};

/** QR / barcode scanner with a rounded frame overlay and a glass hint pill. */
export function QrScanner({ onCode }: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const lastScanAt = useRef(0);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <Card>
        <View style={styles.permissionBody}>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            KEV uses the camera to scan student QR codes. Nothing is recorded.
          </Text>
          <AppButton
            label={permission.canAskAgain ? 'Allow camera' : 'Try again'}
            onPress={() => void requestPermission()}
            testID="qr-permission-button"
          />
        </View>
      </Card>
    );
  }

  return (
    <View style={styles.cameraWrap}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128'] }}
        onBarcodeScanned={({ data }) => {
          const now = Date.now();
          if (!data || now - lastScanAt.current < SCAN_DEBOUNCE_MS) return;
          lastScanAt.current = now;
          onCode(data);
        }}
      />
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.frame} />
        <GlassSurface style={styles.hint}>
          <Text style={styles.hintText}>Point at the student QR code</Text>
        </GlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionBody: { alignItems: 'center', gap: spacing.md },
  permissionTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  permissionText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  cameraWrap: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.black,
    borderRadius: radii.lg,
    overflow: 'hidden',
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    gap: spacing.xl,
    justifyContent: 'center',
  },
  frame: {
    borderColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 3,
    height: 200,
    width: 200,
  },
  hint: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  hintText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
});
