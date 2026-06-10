import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

const DRAWER_CLOSE_DURATION_MS = 200;
const DRAWER_OPEN_DURATION_MS = 260;
const MOSAIC_CLOSE_DURATION_MS = 620;
const MOSAIC_OPEN_DURATION_MS = 760;

export function useDropDownPanel(expandedHeight: number) {
  const [isVisible, setIsVisible] = useState(false);
  const [height] = useState(() => new Animated.Value(0));
  const [animatedProgress] = useState(() => new Animated.Value(0));
  const isVisibleRef = useRef(false);
  const progressRef = useRef(0);

  const updateVisible = useCallback((visible: boolean) => {
    isVisibleRef.current = visible;
    setIsVisible(visible);
  }, []);

  const setProgress = useCallback(
    (progress: number) => {
      const nextProgress = Math.max(0, Math.min(1, progress));
      progressRef.current = nextProgress;
      height.stopAnimation();
      animatedProgress.stopAnimation();
      if (nextProgress > 0 && !isVisibleRef.current) updateVisible(true);
      animatedProgress.setValue(nextProgress);
      height.setValue(expandedHeight * nextProgress);
    },
    [animatedProgress, expandedHeight, height, updateVisible],
  );

  const settle = useCallback(
    (shouldOpen: boolean) => {
      progressRef.current = shouldOpen ? 1 : 0;
      if (shouldOpen && !isVisibleRef.current) updateVisible(true);
      height.stopAnimation();
      animatedProgress.stopAnimation();
      Animated.timing(height, {
        duration: shouldOpen ? DRAWER_OPEN_DURATION_MS : DRAWER_CLOSE_DURATION_MS,
        easing: shouldOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        toValue: shouldOpen ? expandedHeight : 0,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && !shouldOpen) updateVisible(false);
      });
      Animated.timing(animatedProgress, {
        duration: shouldOpen ? MOSAIC_OPEN_DURATION_MS : MOSAIC_CLOSE_DURATION_MS,
        easing: Easing.inOut(Easing.cubic),
        toValue: shouldOpen ? 1 : 0,
        useNativeDriver: false,
      }).start();
    },
    [animatedProgress, expandedHeight, height, updateVisible],
  );

  useEffect(() => {
    if (!isVisibleRef.current) return;
    height.setValue(expandedHeight * progressRef.current);
  }, [expandedHeight, height]);

  const show = useCallback(() => {
    settle(true);
  }, [settle]);

  const hide = useCallback(() => {
    settle(false);
  }, [settle]);

  return { height, hide, isVisible, progress: animatedProgress, setProgress, settle, show };
}
