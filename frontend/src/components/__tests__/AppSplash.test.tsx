import { act, render } from '@testing-library/react-native';

import { AppSplash } from '@/components/AppSplash';

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

    render(<AppSplash onFinish={onFinish} />);
    act(() => jest.advanceTimersByTime(2100));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
