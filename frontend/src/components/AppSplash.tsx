import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  AppLogoMark,
  HERO_LOGO_COLOR,
  HERO_LOGO_SCALE,
  getAppLogoMarkSize,
  getFloatingHeroLogoTop,
} from '@/components/AppLogoMark';
import { SystemStatusBar } from '@/components/SystemStatusBar';
import {
  BG,
  CELL,
  COMMA_HEIGHT,
  COMMA_LEFT,
  COMMA_PATH,
  COMMA_TOP,
  COMMA_WIDTH,
  finalHiddenLines,
  GRID_CENTER_OFFSET,
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
  backgroundOpacity: Animated.Value;
  commaOpacity: Animated.Value;
  commaScale: Animated.Value;
  handoffLogoOpacity: Animated.Value;
  handoffLogoScale: Animated.Value;
  handoffLogoTranslateY: Animated.Value;
  lineOpacity: Animated.Value[];
  overlayOpacity: Animated.Value;
  stageOpacity: Animated.Value;
  stageTranslateX: Animated.Value;
};

function createSplashAnimation(): SplashAnimation {
  return {
    backgroundOpacity: new Animated.Value(1),
    commaOpacity: new Animated.Value(0),
    commaScale: new Animated.Value(0.94),
    handoffLogoOpacity: new Animated.Value(0),
    handoffLogoScale: new Animated.Value(1),
    handoffLogoTranslateY: new Animated.Value(0),
    lineOpacity: lineSpecs.map(() => new Animated.Value(1)),
    overlayOpacity: new Animated.Value(1),
    stageOpacity: new Animated.Value(1),
    stageTranslateX: new Animated.Value(GRID_CENTER_OFFSET),
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

function revealLogo({ commaOpacity, commaScale, stageTranslateX }: SplashAnimation) {
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
    Animated.timing(stageTranslateX, {
      toValue: 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]).start();
}

function handoffLogo(animation: SplashAnimation, targetTranslateY: number) {
  Animated.parallel([
    Animated.timing(animation.stageOpacity, {
      toValue: 0,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(animation.handoffLogoOpacity, {
      toValue: 1,
      duration: 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(animation.backgroundOpacity, {
      toValue: 0,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(animation.handoffLogoScale, {
      toValue: HERO_LOGO_SCALE,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(animation.handoffLogoTranslateY, {
      toValue: targetTranslateY,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]).start();
}

function scheduleSplash(
  animation: SplashAnimation,
  onFinish: () => void,
  targetTranslateY: number,
) {
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
    setTimeout(() => revealLogo(animation), 1220),
    setTimeout(() => handoffLogo(animation, targetTranslateY), 1720),
    setTimeout(() => fadeValue(animation.overlayOpacity, 0, 140), 2360),
    setTimeout(onFinish, 2520),
  );

  return () => {
    for (const timer of timers) clearTimeout(timer);
    for (const opacity of animation.lineOpacity) opacity.stopAnimation();
    animation.commaOpacity.stopAnimation();
    animation.commaScale.stopAnimation();
    animation.backgroundOpacity.stopAnimation();
    animation.handoffLogoOpacity.stopAnimation();
    animation.handoffLogoScale.stopAnimation();
    animation.handoffLogoTranslateY.stopAnimation();
    animation.overlayOpacity.stopAnimation();
    animation.stageOpacity.stopAnimation();
    animation.stageTranslateX.stopAnimation();
  };
}

function useSplashAnimation(isActive: boolean, onFinish: () => void, targetTranslateY: number) {
  const [animation] = useState(createSplashAnimation);

  useEffect(() => {
    if (!isActive) return undefined;
    return scheduleSplash(animation, onFinish, targetTranslateY);
  }, [animation, isActive, onFinish, targetTranslateY]);

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
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const targetLogoTop = getFloatingHeroLogoTop(height, top);
  const targetLogoHeight = getAppLogoMarkSize().height;
  const targetTranslateY = targetLogoTop + targetLogoHeight / 2 - height / 2;
  const animation = useSplashAnimation(isActive, onFinish, targetTranslateY);

  return (
    <>
      <SystemStatusBar backgroundColor={BG} barStyle="dark-content" translucent={false} />
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[styles.screen, styles.overlay, { opacity: animation.overlayOpacity }]}
      >
        <Animated.View style={[styles.background, { opacity: animation.backgroundOpacity }]} />
        <Animated.View
          style={[
            styles.stage,
            {
              opacity: animation.stageOpacity,
              transform: [{ translateX: animation.stageTranslateX }],
            },
          ]}
        >
          <GridLines opacities={animation.lineOpacity} />
          <CommaMark opacity={animation.commaOpacity} scale={animation.commaScale} />
        </Animated.View>
        <Animated.View
          style={[
            styles.handoffLogo,
            {
              opacity: animation.handoffLogoOpacity,
              transform: [
                { translateY: animation.handoffLogoTranslateY },
                { scale: animation.handoffLogoScale },
              ],
            },
          ]}
        >
          <AppLogoMark color={HERO_LOGO_COLOR} scale={1} />
        </Animated.View>
      </Animated.View>
    </>
  );
}

export function AppSplashFinalState() {
  return (
    <View style={[styles.screen, styles.finalScreen]}>
      <View style={styles.stage}>
        <GridLines />
        <CommaMark />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { backgroundColor: BG, bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  screen: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  finalScreen: { backgroundColor: BG },
  overlay: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, zIndex: 100 },
  handoffLogo: { height: LOGO_HEIGHT, position: 'absolute', width: LOGO_WIDTH },
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
