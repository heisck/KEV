import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { durations, radii, spacing, usePalette } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CircularSyncLoaderProps = {
  visible: boolean;
  /** 0..1 floating point progress value */
  progress: number;
  message?: string;
  size?: number;
  strokeWidth?: number;
  testID?: string;
};

/**
 * Modern circular progress loader modal that animates 0..100% with exact percentage display.
 * Used during session creation, password joining, and batch student data sync.
 */
export function CircularSyncLoader({
  visible,
  progress,
  message = 'Syncing student records...',
  size = 140,
  strokeWidth = 12,
  testID = 'circular-sync-loader',
}: CircularSyncLoaderProps) {
  const p = usePalette();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(clamped, { duration: durations.slow });
  }, [animated, clamped]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value),
  }));

  const percentText = `${Math.round(clamped * 100)}%`;

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} testID={testID}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.card, { backgroundColor: p.surface, borderColor: p.hairline }]}>
          <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={p.primary12}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={p.primary}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                animatedProps={animatedProps}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <View style={styles.centerTextContainer}>
              <Text style={[styles.percentageText, { color: p.ink }]}>{percentText}</Text>
            </View>
          </View>

          <Text style={[styles.messageText, { color: p.ink }]}>{message}</Text>
          <Text style={[styles.subText, { color: p.muted }]}>
            {clamped < 1 ? 'Fetching student data & offline images...' : 'Complete!'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    alignItems: 'center',
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xxl,
    width: 280,
  },
  centerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.absoluteFillObject,
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  messageText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
