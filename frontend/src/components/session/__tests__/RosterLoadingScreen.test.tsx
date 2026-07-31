import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RosterLoadingScreen } from '@/components/session/RosterLoadingScreen';

const onRetry = jest.fn();
const onSkip = jest.fn();

const content = (props: Partial<React.ComponentProps<typeof RosterLoadingScreen>> = {}) => (
  <SafeAreaProvider
    initialMetrics={{
      frame: { height: 844, width: 390, x: 0, y: 0 },
      insets: { bottom: 0, left: 0, right: 0, top: 0 },
    }}
  >
    <RosterLoadingScreen
      message="Preparing face verification"
      progress={64}
      state="RUNNING"
      synced={120}
      embedded={80}
      onRetry={onRetry}
      onSkip={onSkip}
      {...props}
    />
  </SafeAreaProvider>
);

beforeEach(() => {
  onRetry.mockClear();
  onSkip.mockClear();
});

it('shows real roster progress and a retry action on failure', () => {
  const screen = render(content());

  expect(screen.getByText('Loading student information')).toBeTruthy();
  expect(screen.getByText('64%')).toBeTruthy();
  expect(screen.getByText('120 synced · 80 ready for face scanning')).toBeTruthy();

  screen.rerender(content({ state: 'FAILED', message: 'University student system is unreachable' }));
  fireEvent.press(screen.getByText('Retry loading'));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it('lets the invigilator leave the sync running in the background once students exist', () => {
  const screen = render(content());

  fireEvent.press(screen.getByText('Skip and load in background'));

  expect(onSkip).toHaveBeenCalledTimes(1);
});

it('hides skip until the first students have landed', () => {
  const screen = render(content({ synced: 0, embedded: 0, state: 'STARTING', progress: 0 }));

  expect(screen.queryByText('Skip and load in background')).toBeNull();
});
