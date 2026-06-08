import { useCallback, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

export function useDropDownPanel(expandedHeight: number) {
  const [isVisible, setIsVisible] = useState(false);
  const [height] = useState(() => new Animated.Value(0));
  const isVisibleRef = useRef(false);

  const updateVisible = useCallback((visible: boolean) => {
    isVisibleRef.current = visible;
    setIsVisible(visible);
  }, []);

  const setProgress = useCallback(
    (progress: number) => {
      const nextProgress = Math.max(0, Math.min(1, progress));
      if (nextProgress > 0 && !isVisibleRef.current) updateVisible(true);
      height.setValue(expandedHeight * nextProgress);
    },
    [expandedHeight, height, updateVisible],
  );

  const settle = useCallback(
    (shouldOpen: boolean) => {
      if (shouldOpen && !isVisibleRef.current) updateVisible(true);
      Animated.timing(height, {
        duration: shouldOpen ? 260 : 200,
        easing: shouldOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        toValue: shouldOpen ? expandedHeight : 0,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && !shouldOpen) updateVisible(false);
      });
    },
    [expandedHeight, height, updateVisible],
  );

  const show = useCallback(() => {
    settle(true);
  }, [settle]);

  const hide = useCallback(() => {
    settle(false);
  }, [settle]);

  return { height, hide, isVisible, setProgress, settle, show };
}
