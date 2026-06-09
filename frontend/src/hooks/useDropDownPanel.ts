import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

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
      Animated.parallel([
        Animated.timing(height, {
          duration: shouldOpen ? 260 : 200,
          easing: shouldOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
          toValue: shouldOpen ? expandedHeight : 0,
          useNativeDriver: false,
        }),
        Animated.timing(animatedProgress, {
          duration: shouldOpen ? 260 : 200,
          easing: shouldOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
          toValue: shouldOpen ? 1 : 0,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished && !shouldOpen) updateVisible(false);
      });
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
