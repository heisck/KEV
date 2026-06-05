import { Animated, Text, View } from 'react-native';

import { CircleButton } from '@/components/room/RoomSetupControls';
import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';

type RoomSetupTopNavProps = {
  isExpanded: boolean;
  onClose?: () => void;
  onCollapse: () => void;
  screenHeight: number;
  topInset: number;
  translateY: Animated.Value;
};

export function RoomSetupTopNav({
  isExpanded,
  onClose,
  onCollapse,
  screenHeight,
  topInset,
  translateY,
}: RoomSetupTopNavProps) {
  const progress = translateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, screenHeight],
    outputRange: [1, 0],
  });
  const closeShift = translateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, screenHeight],
    outputRange: [0, -34],
  });
  const downSpin = translateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, screenHeight],
    outputRange: ['-90deg', '90deg'],
  });
  const titleScale = translateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, screenHeight],
    outputRange: [1, 1.35],
  });

  return (
    <View style={[styles.topNav, { paddingTop: Math.max(topInset, 14) }]}>
      {isExpanded ? (
        <Animated.View style={{ opacity: progress, transform: [{ rotate: downSpin }] }}>
          <CircleButton icon="back" label="Collapse room setup" onPress={onCollapse} />
        </Animated.View>
      ) : (
        <CircleButton icon="close" label="Close room setup" onPress={onClose} />
      )}
      {isExpanded ? (
        <Animated.Text
          style={[styles.navTitle, { opacity: progress, transform: [{ scale: titleScale }] }]}
        >
          New Room Setup
        </Animated.Text>
      ) : (
        <Text style={styles.navTitle}>Room Setup</Text>
      )}
      {isExpanded ? (
        <Animated.View style={{ opacity: progress, transform: [{ translateX: closeShift }] }}>
          <CircleButton icon="close" label="Close room setup" onPress={onClose} />
        </Animated.View>
      ) : (
        <CircleButton hidden icon="close" label="Close room setup" onPress={onClose} />
      )}
    </View>
  );
}
