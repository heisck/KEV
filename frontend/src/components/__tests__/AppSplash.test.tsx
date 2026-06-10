import { act, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppSplash } from '@/components/AppSplash';

const SAFE_AREA_METRICS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
};

describe('AppSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('finishes after the intro animation', () => {
    const onFinish = jest.fn();

    render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AppSplash onFinish={onFinish} />
      </SafeAreaProvider>,
    );
    act(() => jest.advanceTimersByTime(3000));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
