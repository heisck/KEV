import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { SessionDetailDto } from '@/api/schemas';
import { GroupSessionScreen } from '@/screens/kev/GroupSessionScreen';
import { useAuthStore } from '@/store/authStore';

jest.mock('@/components/session/SessionActionsMenu', () => ({ SessionActionsMenu: () => null }));
jest.mock('@/components/ui/NativePreferenceSwitch', () => ({
  NativePreferenceSwitch: ({ testID }: { testID?: string }) => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID={testID} />;
  },
}));

const mockPush = jest.fn();
const mockDetail: SessionDetailDto = {
  session: {
    id: 2,
    sessionCode: 'KEV-ABCD',
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
    checkedInCount: 1,
    invigilatorCount: 1,
  },
  invigilators: [
    {
      userId: '11111111-1111-1111-1111-111111111111',
      displayName: 'Lecturer One',
      email: 'lecturer@example.com',
      pictureUrl: null,
      joinedAt: '2026-07-20T08:00:00Z',
      assignedByAdmin: false,
      role: 'CREATOR',
    },
  ],
  attendance: [
    {
      id: 8,
      method: 'NFC',
      status: 'CHECKED_IN',
      checkedInAt: '2026-07-20T09:30:00Z',
      removedAt: null,
      student: {
        id: 7,
        indexNumber: '10953001',
        fullName: 'Ama Boateng',
        programme: 'BSc CS',
        level: 300,
        photoUrl: 'https://example.com/ama.jpg',
        enrolled: true,
        feesStatus: 'PAID',
        eligible: true,
        courses: ['DCIT 301'],
      },
    },
  ],
};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ exam: '2' }),
  useRouter: () => ({ back: jest.fn(), push: mockPush, replace: jest.fn() }),
}));

jest.mock('@/api/hooks', () => ({
  useJoinSession: () => ({ mutateAsync: jest.fn() }),
  useSessionDetail: () => ({ data: mockDetail }),
}));

beforeEach(() => {
  mockPush.mockReset();
  mockDetail.session.status = 'ONGOING';
});

it('shows the result preference and opens an attending student as already added', () => {
  useAuthStore.setState({
    status: 'authenticated',
    user: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'lecturer@example.com',
      role: 'LECTURER',
      plan: 'FREE',
    },
  });
  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <GroupSessionScreen />
    </SafeAreaProvider>,
  );

  expect(screen.getByTestId('success-page-toggle')).toBeTruthy();
  expect(screen.getByTestId('session-student-search')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Ama Boateng result'));
  expect(mockPush).toHaveBeenCalledWith({
    pathname: '/verify/result',
    params: { attendance: '8', exam: '2', mode: 'profile', status: 'added', student: '7' },
  });
});

it('shows closed without join or scan controls for a past session', () => {
  mockDetail.session.status = 'COMPLETED';
  useAuthStore.setState({
    status: 'authenticated',
    user: {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'other@example.com',
      role: 'LECTURER',
      plan: 'FREE',
    },
  });
  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <GroupSessionScreen />
    </SafeAreaProvider>,
  );

  expect(screen.getAllByText('Closed')).toHaveLength(2);
  expect(screen.queryByText('Enter session password')).toBeNull();
  expect(screen.queryByLabelText('Face verification')).toBeNull();
});
