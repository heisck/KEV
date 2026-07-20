import type { ReactNode } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';

import { RoomSlider } from '@/components/session/LocationControls';

let mockPanStart: (() => void) | undefined;
let mockPanUpdate: ((event: { translationX: number }) => void) | undefined;

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  const pan = {
    onStart(callback: () => void) {
      mockPanStart = callback;
      return this;
    },
    onUpdate(callback: (event: { translationX: number }) => void) {
      mockPanUpdate = callback;
      return this;
    },
  };
  return {
    Gesture: { Pan: () => pan },
    GestureDetector: ({ children }: { children?: ReactNode }) =>
      React.createElement(View, null, children),
  };
});

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View },
    runOnJS: (callback: (value: number) => void) => callback,
    useAnimatedStyle: (factory: () => object) => factory(),
    useSharedValue: (value: number) => ({ value }),
  };
});

describe('RoomSlider', () => {
  it('fires one selection haptic for each room crossed', () => {
    const onChange = jest.fn();
    const selectionAsync = jest.mocked(Haptics.selectionAsync);
    selectionAsync.mockClear();
    const { getByTestId } = render(<RoomSlider onChange={onChange} value={1} />);

    fireEvent(getByTestId('room-slider-track'), 'layout', {
      nativeEvent: { layout: { height: 56, width: 200, x: 0, y: 0 } },
    });
    act(() => {
      mockPanStart?.();
      mockPanUpdate?.({ translationX: 20 });
      mockPanUpdate?.({ translationX: 21 });
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(selectionAsync).toHaveBeenCalledTimes(1);
  });
});
