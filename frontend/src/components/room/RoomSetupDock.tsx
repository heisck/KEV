import { useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, View } from 'react-native';

import { RoomIcon, type RoomIconName } from '@/components/room/RoomSetupControls';
import { roomSetupDockStyles as styles } from '@/components/room/roomSetupDockStyles';

type DockCorner = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';

type RoomSetupDockProps = {
  bottomInset: number;
  screenHeight: number;
  screenWidth: number;
  topInset: number;
};

const DOCK_SIZE = 54;
const EDGE = 16;

function getCornerPosition(
  screenWidth: number,
  screenHeight: number,
  topInset: number,
  bottomInset: number,
) {
  return {
    bottomLeft: { x: EDGE, y: screenHeight - bottomInset - DOCK_SIZE - 22 },
    bottomRight: {
      x: screenWidth - DOCK_SIZE - EDGE,
      y: screenHeight - bottomInset - DOCK_SIZE - 22,
    },
    topLeft: { x: EDGE, y: topInset + 72 },
    topRight: { x: screenWidth - DOCK_SIZE - EDGE, y: topInset + 72 },
  };
}

function getNearestCorner(
  x: number,
  y: number,
  screenWidth: number,
  screenHeight: number,
): DockCorner {
  const isLeft = x < screenWidth / 2;
  const isTop = y < screenHeight / 2;

  if (isTop) return isLeft ? 'topLeft' : 'topRight';
  return isLeft ? 'bottomLeft' : 'bottomRight';
}

export function RoomSetupDock({
  bottomInset,
  screenHeight,
  screenWidth,
  topInset,
}: RoomSetupDockProps) {
  const initialPosition = getCornerPosition(
    screenWidth,
    screenHeight,
    topInset,
    bottomInset,
  ).bottomLeft;
  const [isExpanded, setIsExpanded] = useState(false);
  const [corner, setCorner] = useState<DockCorner>('bottomLeft');
  const [arrowProgress] = useState(() => new Animated.Value(0));
  const [position] = useState(() => new Animated.ValueXY(initialPosition));
  const arrowRotate = arrowProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  useEffect(() => {
    Animated.timing(arrowProgress, {
      duration: 180,
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [arrowProgress, isExpanded]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) + Math.abs(gesture.dy) > 8,
        onPanResponderGrant: () => {
          position.stopAnimation();
          position.extractOffset();
          position.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          position.flattenOffset();
          const nextCorner = getNearestCorner(
            gesture.moveX,
            gesture.moveY,
            screenWidth,
            screenHeight,
          );
          setCorner(nextCorner);
          Animated.spring(position, {
            toValue: getCornerPosition(screenWidth, screenHeight, topInset, bottomInset)[
              nextCorner
            ],
            useNativeDriver: false,
          }).start();
        },
      }),
    [bottomInset, position, screenHeight, screenWidth, topInset],
  );

  const isTopCorner = corner.startsWith('top');
  const isRightCorner = corner.endsWith('Right');
  const verticalRailStyle = isTopCorner ? { top: 62 } : { bottom: 62 };
  const horizontalStyle = isRightCorner ? { right: 0 } : { left: 0 };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.dockWrap,
        { transform: [{ translateX: position.x }, { translateY: position.y }] },
      ]}
    >
      {isExpanded ? (
        <View style={[styles.iconRail, verticalRailStyle, horizontalStyle]}>
          <DockIcon label="Open home dock" name="home" />
          <DockIcon label="Open profile dock" name="profile" />
        </View>
      ) : null}
      <Pressable
        accessibilityLabel={isExpanded ? 'Collapse room dock' : 'Expand room dock'}
        accessibilityRole="button"
        onPress={() => {
          setIsExpanded((current) => !current);
        }}
        style={styles.mainButton}
      >
        <Animated.View style={{ transform: [{ rotate: arrowRotate }] }}>
          <RoomIcon color="rgba(12,42,28,0.58)" name="arrowUp" size={24} strokeWidth={2.4} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function DockIcon({ label, name }: { label: string; name: RoomIconName }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" style={styles.railButton}>
      <RoomIcon color="#3A6700" name={name} size={20} strokeWidth={1.9} />
    </Pressable>
  );
}
