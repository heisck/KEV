import { fireEvent, render, waitFor } from '@testing-library/react-native';

import type { SessionDto } from '@/api/schemas';
import { ExamDetailScreen } from '@/screens/kev/ExamDetailScreen';

const mockPush = jest.fn();
const mockJoin = jest.fn();
let mockJoined = true;
const mockSession: SessionDto = {
  id: 42,
  sessionCode: 'KEV-F7K9',
  sessionPassword: 'ABC789',
  title: 'DCIT 301',
  building: 'Engineering Block',
  floor: 'Floor 2',
  room: '18',
  courseCodes: ['DCIT 301'],
  indexRangeStart: '10000001',
  indexRangeEnd: '10000100',
  examDate: '2026-07-20',
  startTime: '09:00',
  endTime: '12:00',
  verificationMethods: ['FACE', 'NFC', 'MANUAL'],
  status: 'ONGOING',
  startedAt: '2026-07-20T09:00:00Z',
  endedAt: null,
  checkedInCount: 4,
  invigilatorCount: 2,
  joined: true,
};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '42' }),
  useRouter: () => ({ back: jest.fn(), push: mockPush, replace: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/api/hooks', () => ({
  useJoinSessionById: () => ({ mutateAsync: mockJoin }),
  useSessionDetail: (_id: number, enabled: boolean) => ({
    data: enabled ? { attendance: [], invigilators: [], session: mockSession } : undefined,
  }),
  useSessions: () => ({ data: [{ ...mockSession, joined: mockJoined }] }),
}));

jest.mock('@/components/ui/BottomDrawer', () => ({
  BottomDrawer: ({
    children,
    testID,
    visible,
  }: React.PropsWithChildren<{ testID?: string; visible: boolean }>) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return visible ? <View testID={testID}>{children}</View> : null;
  },
}));

beforeEach(() => {
  mockJoined = true;
  mockSession.status = 'ONGOING';
  mockJoin.mockReset();
  mockPush.mockReset();
});

it('shows join credentials and opens Group Session from the scan icon', () => {
  const screen = render(<ExamDetailScreen />);

  expect(screen.getByText('ABC789')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Scan'));

  expect(mockPush).toHaveBeenCalledWith({
    pathname: '/group-session',
    params: { exam: '42' },
  });
});

it('shows a plus until the lecturer joins with the session password', async () => {
  mockJoined = false;
  mockJoin.mockResolvedValue({ ...mockSession, joined: true });
  const screen = render(<ExamDetailScreen />);

  fireEvent.press(screen.getByLabelText('Join session'));
  fireEvent.changeText(screen.getByTestId('join-session-password'), 'ABC789');
  fireEvent.press(screen.getByTestId('join-session-submit'));

  await waitFor(() => expect(mockJoin).toHaveBeenCalledWith('ABC789'));
  expect(screen.getByLabelText('Scan')).toBeTruthy();
});

it('removes the room-map action', () => {
  const screen = render(<ExamDetailScreen />);

  expect(screen.queryByText('Open room map')).toBeNull();
});

it('shows a closed state and disables actions after a session passes', () => {
  mockJoined = false;
  mockSession.status = 'COMPLETED';
  const screen = render(<ExamDetailScreen />);

  expect(screen.getByText('Closed')).toBeTruthy();
  expect(screen.queryByLabelText('Join session')).toBeNull();
  fireEvent.press(screen.getByLabelText('Face verification'));
  expect(mockPush).not.toHaveBeenCalled();
});
