import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { LIMEADE } from '@/screens/authConfig';
import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';
import { RoomIcon } from '@/components/room/RoomSetupControls';

type RoomSetupSwipePromptProps = { onExpand: () => void };
const ARROW_COUNT = 5;
const ARROWS = Array.from({ length: ARROW_COUNT }, (_, index) => index);
const BASE_ARROW_COLOR = '#8EA2B6';
const PULSE_INTERVAL_MS = 220;
const PULSE_COLORS = ['#CBEF9A', '#95CE55', LIMEADE] as const;

function getArrowColor(index: number, activeArrow: number) {
  const pulseIndex = (index - activeArrow + ARROW_COUNT) % ARROW_COUNT;

  return pulseIndex < PULSE_COLORS.length ? PULSE_COLORS[pulseIndex] : BASE_ARROW_COLOR;
}

export function RoomSetupSwipePrompt({ onExpand }: RoomSetupSwipePromptProps) {
  const [activeArrow, setActiveArrow] = useState(ARROW_COUNT - 1);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveArrow((current) => (current === 0 ? ARROW_COUNT - 1 : current - 1));
    }, PULSE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <Pressable
      accessibilityLabel="Swipe to create a new room"
      accessibilityRole="button"
      onPress={onExpand}
      onTouchStart={(event) => {
        touchStartY.current = event.nativeEvent.pageY;
      }}
      onTouchEnd={(event) => {
        const startY = touchStartY.current;
        touchStartY.current = null;
        if (startY !== null && startY - event.nativeEvent.pageY > 24) onExpand();
      }}
      style={styles.swipePrompt}
    >
      <View style={styles.arrowStack}>
        {ARROWS.map((index) => (
          <View key={index} style={index > 0 && styles.stackedArrow}>
            <RoomIcon
              color={getArrowColor(index, activeArrow)}
              name="arrowUp"
              size={20}
              strokeWidth={index === activeArrow ? 2.4 : 2}
            />
          </View>
        ))}
      </View>
      <Text style={styles.swipeText}>Swipe to create a new room</Text>
    </Pressable>
  );
}
