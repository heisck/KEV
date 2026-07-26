import { render } from '@testing-library/react-native';

import { CircularSyncLoader } from '@/components/ui/CircularSyncLoader';

describe('CircularSyncLoader', () => {
  it('renders percentage and message when visible', () => {
    const screen = render(
      <CircularSyncLoader
        visible={true}
        progress={0.45}
        message="Downloading student data..."
        testID="test-loader"
      />,
    );

    expect(screen.getByTestId('test-loader')).toBeTruthy();
    expect(screen.getByText('45%')).toBeTruthy();
    expect(screen.getByText('Downloading student data...')).toBeTruthy();
  });

  it('renders nothing when not visible', () => {
    const screen = render(
      <CircularSyncLoader visible={false} progress={0.5} testID="test-loader" />,
    );

    expect(screen.queryByTestId('test-loader')).toBeNull();
  });
});
