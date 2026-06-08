import { Animated, View } from 'react-native';

import { CircleButton } from '@/components/room/RoomSetupControls';
import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';

type RoomSetupTopNavProps = {
  onCollapse: () => void;
  screenHeight: number;
  topInset: number;
  translateY: Animated.Value;
};

export function RoomSetupTopNav({
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
      <Animated.View style={{ opacity: progress, transform: [{ rotate: downSpin }] }}>
        <CircleButton icon="back" label="Collapse room setup" onPress={onCollapse} />
      </Animated.View>
      <Animated.Text
        style={[styles.navTitle, { opacity: progress, transform: [{ scale: titleScale }] }]}
      >
        New Room Setup
      </Animated.Text>
      <View style={styles.navSpacer} />
    </View>
  );
}
