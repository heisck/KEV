import { useCallback, useState } from 'react';
import { Animated, Easing } from 'react-native';

export function useSlideUpPanel(screenHeight: number) {
  const [isVisible, setIsVisible] = useState(false);
  const [translateY] = useState(() => new Animated.Value(screenHeight));

  const show = useCallback(() => {
    setIsVisible(true);
    translateY.setValue(screenHeight);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [screenHeight, translateY]);

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setIsVisible(false);
    });
  }, [screenHeight, translateY]);

  return { hide, isVisible, show, translateY };
}
