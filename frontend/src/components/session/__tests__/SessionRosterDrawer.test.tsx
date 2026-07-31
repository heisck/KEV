import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionRosterDrawer } from '@/components/session/SessionRosterDrawer';
import type { RosterIngestStatus, RosterStudent } from '@/api/sessions';

const mockRosterStatus = jest.fn();
const mockSessionRoster = jest.fn();
const mockRetry = jest.fn();

jest.mock('@/api/hooks', () => ({
  useRosterStatus: (...args: unknown[]) => mockRosterStatus(...args),
  useSessionRoster: (...args: unknown[]) => mockSessionRoster(...args),
  useRetryRoster: () => ({ mutate: mockRetry, isPending: false }),
}));

const student = (indexNumber: string, faceReady: boolean): RosterStudent => ({
  indexNumber,
  fullName: `Student ${indexNumber}`,
  photoUrl: null,
  nfcCode: null,
  faceReady,
});

function renderDrawer(state: RosterIngestStatus['state'], students: RosterStudent[]) {
  mockRosterStatus.mockReturnValue({ data: { state, progress: 45 } });
  mockSessionRoster.mockReturnValue({ data: students, isLoading: false });
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <SessionRosterDrawer visible onClose={jest.fn()} sessionId={7} />
    </SafeAreaProvider>,
  );
}

it('shows students already synced and marks the ones still being prepared', () => {
  const screen = renderDrawer('RUNNING', [student('6180001', true), student('6180002', false)]);

  expect(screen.getByText('2 students')).toBeTruthy();
  expect(screen.getByText('Student 6180001')).toBeTruthy();
  expect(screen.getByText('Preparing')).toBeTruthy();
});

it('polls for new rows while the background sync is still running', () => {
  renderDrawer('RUNNING', [student('6180001', true)]);

  expect(mockSessionRoster).toHaveBeenCalledWith(7, true);
});

it('stops polling once the sync is no longer live', () => {
  renderDrawer('COMPLETED', [student('6180001', true)]);

  expect(mockSessionRoster).toHaveBeenCalledWith(7, false);
});

/** A finished sync that left students unembedded is stranded — offer a way to re-run it. */
it('offers a reload when the sync stopped with students still missing face data', () => {
  const screen = renderDrawer('COMPLETED', [student('6180001', true), student('6180002', false)]);

  fireEvent.press(screen.getByTestId('roster-reload'));

  expect(mockRetry).toHaveBeenCalledWith(7);
});

it('hides the reload while the sync is still running', () => {
  const screen = renderDrawer('RUNNING', [student('6180002', false)]);

  expect(screen.queryByTestId('roster-reload')).toBeNull();
});
