import { Animated, Pressable, Text, TextInput, View } from 'react-native';

import { nfcVerificationStyles as styles } from '@/screens/nfcVerificationStyles';

type ManualEntryDrawerProps = {
  bottomInset: number;
  onChangeStudentId: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  studentId: string;
  translateY: Animated.Value;
};

export function ManualEntryDrawer({
  bottomInset,
  onChangeStudentId,
  onClose,
  onSubmit,
  studentId,
  translateY,
}: ManualEntryDrawerProps) {
  return (
    <View style={styles.drawerOverlay}>
      <Pressable
        accessibilityLabel="Close manual entry drawer"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.drawerScrim}
      />
      <Animated.View
        style={[
          styles.manualDrawer,
          { paddingBottom: bottomInset + 18, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.drawerHandle} />
        <TextInput
          autoCapitalize="characters"
          autoCorrect={false}
          disableFullscreenUI
          onChangeText={onChangeStudentId}
          placeholder="Enter index number or student ID"
          placeholderTextColor="#667085"
          selectionColor="#10231D"
          style={styles.drawerInput}
          underlineColorAndroid="transparent"
          value={studentId}
        />
        <Pressable accessibilityRole="button" onPress={onSubmit} style={styles.drawerSubmit}>
          <Text style={styles.drawerSubmitText}>Submit</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
