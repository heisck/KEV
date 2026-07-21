import { useRouter } from 'expo-router';
import { type ReactNode, useCallback } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import {
  adjacentTabRoute,
  type SwipeDirection,
  type SwipeTab,
} from '@/components/navigation/tabSwipeRoutes';

const EDGE_WIDTH = 28;
const SWIPE_DISTANCE = 72;

/** iOS-style edge paging across the ordered main tabs. */
export function TabSwipeNavigator({ tab, children }: { tab: SwipeTab; children: ReactNode }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const startX = useSharedValue(0);
  const navigate = useCallback(
    (direction: SwipeDirection) => {
      const destination = adjacentTabRoute(tab, direction);
      if (destination) router.replace(destination);
    },
    [router, tab],
  );
  const pan = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .failOffsetY([-16, 16])
    .onBegin((event) => {
      startX.value = event.absoluteX;
    })
    .onEnd((event) => {
      if (startX.value <= EDGE_WIDTH && event.translationX >= SWIPE_DISTANCE) {
        runOnJS(navigate)('previous');
      } else if (startX.value >= width - EDGE_WIDTH && event.translationX <= -SWIPE_DISTANCE) {
        runOnJS(navigate)('next');
      }
    });

  return (
    <GestureDetector gesture={pan}>
      <View collapsable={false} style={styles.screen}>
        {children}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });
