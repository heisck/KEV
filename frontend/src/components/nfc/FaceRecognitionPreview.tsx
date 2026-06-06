import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoomIcon } from '@/components/room/RoomSetupControls';
import { SystemStatusBar } from '@/components/SystemStatusBar';
import { nfcVerificationStyles as styles } from '@/screens/nfcVerificationStyles';

type FaceRecognitionPreviewProps = {
  onClose: () => void;
  onSubmit?: () => void;
};

export function FaceRecognitionPreview({ onClose, onSubmit }: FaceRecognitionPreviewProps) {
  const { bottom, top } = useSafeAreaInsets();

  return (
    <View style={styles.cameraScreen}>
      <SystemStatusBar backgroundColor="#050807" barStyle="light-content" />
      <View style={[styles.cameraTopBar, { paddingTop: Math.max(top, 14) }]}>
        <Pressable
          accessibilityLabel="Close face recognition"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.cameraCloseButton}
        >
          <RoomIcon color="#FFFFFF" name="close" size={18} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.cameraCopy}>
          <Text style={styles.cameraTitle}>Face Recognition</Text>
          <Text style={styles.cameraText}>Look straight at the camera</Text>
        </View>
        <View style={styles.cameraSpacer} />
      </View>
      <View style={styles.cameraPreview} />
      <View style={[styles.cameraBottomBar, { paddingBottom: bottom + 24 }]}>
        <Pressable
          accessibilityLabel="Send face recognition capture"
          accessibilityRole="button"
          onPress={onSubmit}
          style={styles.cameraSendButton}
        >
          <RoomIcon color="#FFFFFF" name="send" size={30} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}
