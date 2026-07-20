import { fireEvent, render } from '@testing-library/react-native';

import type { SessionDto } from '@/api/schemas';
import { ExamDetailScreen } from '@/screens/kev/ExamDetailScreen';

const mockPush = jest.fn();
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
};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '42' }),
  useRouter: () => ({ back: jest.fn(), push: mockPush }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

jest.mock('@/api/hooks', () => ({
  useSessionDetail: () => ({
    data: { attendance: [], invigilators: [], session: mockSession },
  }),
  useSessions: () => ({ data: [mockSession] }),
}));

it('shows join credentials and opens Group Session from the scan icon', () => {
  const screen = render(<ExamDetailScreen />);

  expect(screen.getByText('ABC789')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Scan'));

  expect(mockPush).toHaveBeenCalledWith({
    pathname: '/group-session',
    params: { exam: '42' },
  });
});
