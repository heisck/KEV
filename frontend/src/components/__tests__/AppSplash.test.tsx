import { act, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppSplash } from '@/components/AppSplash';
import { useSettingsStore } from '@/store/settingsStore';
import { getPalette } from '@/theme/palette';

const SAFE_AREA_METRICS = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 0, left: 0, right: 0, top: 0 },
};

describe('AppSplash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useSettingsStore.setState({ theme: 'light' });
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

  it('uses the dark palette without changing the animation', () => {
    useSettingsStore.setState({ theme: 'dark' });
    const { getAllByTestId, getByTestId } = render(
      <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
        <AppSplash onFinish={jest.fn()} />
      </SafeAreaProvider>,
    );
    const darkPalette = getPalette(true);

    expect(
      StyleSheet.flatten(
        getByTestId('splash-background', { includeHiddenElements: true }).props.style,
      ).backgroundColor,
    ).toBe(darkPalette.bg);
    expect(
      StyleSheet.flatten(
        getAllByTestId('splash-grid-line', { includeHiddenElements: true })[0].props.style,
      ).backgroundColor,
    ).toBe(darkPalette.ink);
  });
});
