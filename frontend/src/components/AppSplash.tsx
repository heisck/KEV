import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  BG,
  CELL,
  COMMA_HEIGHT,
  COMMA_LEFT,
  COMMA_PATH,
  COMMA_TOP,
  COMMA_WIDTH,
  finalHiddenLines,
  GRID_WIDTH,
  hideLine,
  INK,
  LINE,
  lineIndex,
  lineSpecs,
  LOGO_HEIGHT,
  LOGO_WIDTH,
  mergeSteps,
  removeCell,
  vanishSteps,
  type LineSpec,
} from '@/components/splashLogo';

type AppSplashProps = { isActive?: boolean; onFinish: () => void };

type SplashAnimation = {
  commaOpacity: Animated.Value;
  commaScale: Animated.Value;
  lineOpacity: Animated.Value[];
  overlayOpacity: Animated.Value;
};

function createSplashAnimation(): SplashAnimation {
  return {
    commaOpacity: new Animated.Value(0),
    commaScale: new Animated.Value(0.94),
    lineOpacity: lineSpecs.map(() => new Animated.Value(1)),
    overlayOpacity: new Animated.Value(1),
  };
}

function fadeValue(value: Animated.Value, toValue: number, duration: number) {
  Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
}

function revealComma({ commaOpacity, commaScale }: SplashAnimation) {
  Animated.parallel([
    Animated.timing(commaOpacity, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.spring(commaScale, {
      toValue: 1,
      damping: 16,
      mass: 0.7,
      stiffness: 150,
      useNativeDriver: true,
    }),
  ]).start();
}

function scheduleSplash(animation: SplashAnimation, onFinish: () => void) {
  const removed = new Set<number>();
  const hidden = new Set<string>();
  const hideAnimatedLine = (key: string) => {
    const index = lineIndex.get(key);
    if (index !== undefined) fadeValue(animation.lineOpacity[index], 0, 180);
  };

  const timers = vanishSteps.map((step) =>
    setTimeout(() => removeCell(step.row, step.col, removed, hidden, hideAnimatedLine), step.at),
  );

  for (const step of mergeSteps) {
    timers.push(
      setTimeout(() => {
        for (const key of step.keys) hideLine(key, hidden, hideAnimatedLine);
      }, step.at),
    );
  }

  timers.push(
    setTimeout(() => revealComma(animation), 1220),
    setTimeout(() => fadeValue(animation.overlayOpacity, 0, 260), 1820),
    setTimeout(onFinish, 2100),
  );

  return () => {
    for (const timer of timers) clearTimeout(timer);
    for (const opacity of animation.lineOpacity) opacity.stopAnimation();
    animation.commaOpacity.stopAnimation();
    animation.commaScale.stopAnimation();
    animation.overlayOpacity.stopAnimation();
  };
}

function useSplashAnimation(isActive: boolean, onFinish: () => void) {
  const [animation] = useState(createSplashAnimation);

  useEffect(() => {
    if (!isActive) return undefined;
    return scheduleSplash(animation, onFinish);
  }, [animation, isActive, onFinish]);

  return animation;
}

function getLineStyle(line: LineSpec) {
  const base = {
    left: line.col * CELL,
    position: 'absolute' as const,
    top: line.row * CELL,
  };
  return line.direction === 'h'
    ? [styles.line, base, styles.horizontalLine]
    : [styles.line, base, styles.verticalLine];
}

function GridLines({ opacities }: { opacities?: Animated.Value[] }) {
  return (
    <View style={styles.grid}>
      {lineSpecs.map((line, index) => (
        <Animated.View
          key={line.key}
          style={[
            getLineStyle(line),
            { opacity: opacities?.[index] ?? (finalHiddenLines.has(line.key) ? 0 : 1) },
          ]}
        />
      ))}
    </View>
  );
}

function CommaMark({
  opacity,
  scale,
}: {
  opacity?: Animated.Value | number;
  scale?: Animated.Value;
}) {
  return (
    <Animated.View
      style={[styles.commaMark, { opacity: opacity ?? 1, transform: [{ scale: scale ?? 1 }] }]}
    >
      <Svg height="100%" viewBox="0 0 115 178" width="100%">
        <Path d={COMMA_PATH} fill={INK} />
      </Svg>
    </Animated.View>
  );
}

export function AppSplash({ isActive = true, onFinish }: AppSplashProps) {
  const animation = useSplashAnimation(isActive, onFinish);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.screen, styles.overlay, { opacity: animation.overlayOpacity }]}
    >
      <View style={styles.stage}>
        <GridLines opacities={animation.lineOpacity} />
        <CommaMark opacity={animation.commaOpacity} scale={animation.commaScale} />
      </View>
    </Animated.View>
  );
}

export function AppSplashFinalState() {
  return (
    <View style={styles.screen}>
      <View style={styles.stage}>
        <GridLines />
        <CommaMark />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', backgroundColor: BG, flex: 1, justifyContent: 'center' },
  overlay: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, zIndex: 100 },
  stage: { height: LOGO_HEIGHT, width: LOGO_WIDTH },
  grid: { height: LOGO_HEIGHT, left: 0, position: 'absolute', top: 0, width: GRID_WIDTH },
  line: { backgroundColor: LINE, position: 'absolute' },
  horizontalLine: { height: 1, width: CELL },
  verticalLine: { height: CELL, width: 1 },
  commaMark: {
    height: COMMA_HEIGHT,
    left: COMMA_LEFT,
    position: 'absolute',
    top: COMMA_TOP,
    width: COMMA_WIDTH,
  },
});
