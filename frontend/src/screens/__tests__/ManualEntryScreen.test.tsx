import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ManualEntryScreen } from '@/screens/kev/ManualEntryScreen';

const mockCompleteScan = jest.fn();

jest.mock('@/hooks/useMockScan', () => ({ useMockScan: () => mockCompleteScan }));
jest.mock('@/hooks/useScanNavigation', () => ({
  useScanNavigation: () => ({ goBack: jest.fn(), locked: false }),
}));
jest.mock('@/hooks/useScanMethodGuard', () => ({
  useScanMethodGuard: () => ({ allowedMethods: ['MANUAL'], canUse: true }),
}));
jest.mock('@/hooks/useScanSession', () => ({ useScanSessionId: () => '42' }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

beforeEach(() => {
  mockCompleteScan.mockReset().mockResolvedValue('added');
});

/** Check-in resolves the index itself, so the old pre-flight lookup is pure latency. */
it('checks in directly from the index number without a separate lookup', async () => {
  const screen = render(<ManualEntryScreen />);
  const input = screen.getByTestId('manual-index');

  expect(input.props.returnKeyType).not.toBe('go');
  fireEvent.changeText(input, '4211020');
  fireEvent.press(screen.getByText('Send'));

  await waitFor(() => expect(mockCompleteScan).toHaveBeenCalledWith('4211020'));
});

it('shows the inline not-found error when check-in reports an unknown index', async () => {
  mockCompleteScan.mockResolvedValue('notfound');
  const screen = render(<ManualEntryScreen />);

  fireEvent.changeText(screen.getByTestId('manual-index'), '9999999');
  fireEvent.press(screen.getByText('Send'));

  await waitFor(() => expect(screen.getByText(/Student not found/)).toBeTruthy());
});

it('keeps the error hidden for a successful check-in', async () => {
  const screen = render(<ManualEntryScreen />);

  fireEvent.changeText(screen.getByTestId('manual-index'), '4211020');
  fireEvent.press(screen.getByText('Send'));

  await waitFor(() => expect(mockCompleteScan).toHaveBeenCalled());
  expect(screen.queryByText(/Student not found/)).toBeNull();
});
