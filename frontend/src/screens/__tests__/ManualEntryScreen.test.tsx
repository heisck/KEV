import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ManualEntryScreen } from '@/screens/kev/ManualEntryScreen';

const mockCompleteScan = jest.fn();
const mockLookupStudent = jest.fn();

jest.mock('@/api/directory', () => ({
  lookupStudent: (...args: unknown[]) => mockLookupStudent(...args),
}));
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
  mockCompleteScan.mockReset().mockResolvedValue(undefined);
  mockLookupStudent.mockReset().mockResolvedValue({
    id: 7,
    indexNumber: '4211020',
    fullName: 'Ama Boateng',
    programme: 'BSc CS',
    level: 300,
    photoUrl: null,
    enrolled: true,
    feesStatus: 'PAID',
    eligible: true,
    courses: ['DCIT 301'],
  });
});

it('submits manual entry from a visible Send button instead of the keyboard Go action', async () => {
  const screen = render(<ManualEntryScreen />);
  const input = screen.getByTestId('manual-index');

  expect(input.props.returnKeyType).not.toBe('go');
  fireEvent.changeText(input, '4211020');
  fireEvent.press(screen.getByText('Send'));

  await waitFor(() => expect(mockLookupStudent).toHaveBeenCalledWith('4211020'));
  expect(mockCompleteScan).toHaveBeenCalledWith(
    expect.objectContaining({ index: '4211020', name: 'Ama Boateng' }),
  );
});
