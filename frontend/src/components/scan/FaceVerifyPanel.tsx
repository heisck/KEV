import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useFaceVerify } from '@/api/hooks';
import { AppButton, ProgressRing, StatusPill } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';

type FaceVerifyPanelProps = {
  indexNumber: string;
  /** Fires when the face matches, so the caller can offer a FACE-method check-in. */
  onMatch: () => void;
};

/** Inline front-camera capture → face verify → similarity ring + verdict. */
export function FaceVerifyPanel({ indexNumber, onMatch }: FaceVerifyPanelProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const faceVerify = useFaceVerify();
  const result = faceVerify.data;

  const capture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (!photo?.uri) return;
    faceVerify.mutate({
      indexNumber,
      probe: { uri: photo.uri, name: 'probe.jpg', type: 'image/jpeg' },
    });
  };

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <View style={styles.panel}>
        <Text style={styles.hint}>Face verification needs the camera.</Text>
        <AppButton label="Allow camera" variant="ghost" onPress={() => void requestPermission()} />
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.panel}>
        <ProgressRing progress={result.similarity} label="match" />
        <StatusPill
          label={result.match ? 'Face matched' : 'No match'}
          tone={result.match ? 'success' : 'error'}
        />
        {result.match ? (
          <AppButton label="Mark IN (face verified)" onPress={onMatch} testID="face-mark-in" />
        ) : (
          <AppButton label="Try again" variant="ghost" onPress={() => faceVerify.reset()} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} facing="front" style={StyleSheet.absoluteFill} />
      </View>
      {faceVerify.isError ? (
        <Text style={styles.error}>Verification failed. Try again.</Text>
      ) : null}
      <AppButton
        label={faceVerify.isPending ? 'Verifying…' : 'Capture & verify'}
        disabled={faceVerify.isPending}
        onPress={() => void capture()}
        testID="face-capture"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { alignItems: 'center', alignSelf: 'stretch', gap: spacing.lg },
  cameraWrap: {
    aspectRatio: 1,
    backgroundColor: colors.black,
    borderRadius: radii.lg,
    overflow: 'hidden',
    width: '70%',
  },
  hint: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  error: { color: colors.error, fontSize: 13, textAlign: 'center' },
});
