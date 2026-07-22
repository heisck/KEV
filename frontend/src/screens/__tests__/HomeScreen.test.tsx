import type { ReactNode } from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from '@/screens/kev/HomeScreen';
import { useAuthStore } from '@/store/authStore';
import { useClearedSessionsStore } from '@/store/clearedSessionsStore';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/api/hooks', () => ({
  useSessions: () => ({
    data: [
      {
        id: 1,
        building: 'Engineering',
        checkedInCount: 0,
        courseCodes: ['PAST 101'],
        examDate: '2026-07-01',
        sessionCode: 'KEV-PAST',
        startedAt: '2026-07-01T08:00:00Z',
        status: 'COMPLETED',
        verificationMethods: ['NFC'],
      },
      {
        id: 2,
        building: 'Science',
        checkedInCount: 0,
        courseCodes: ['NEW 202'],
        examDate: '2026-08-01',
        sessionCode: 'KEV-NEW',
        startedAt: '2026-08-01T08:00:00Z',
        status: 'UPCOMING',
        verificationMethods: ['NFC'],
      },
    ],
    isLoading: false,
  }),
}));
jest.mock('@/components/kev/chrome', () => {
  const { Pressable } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    CircleButton: ({
      children,
      label,
      onPress,
    }: {
      children: ReactNode;
      label: string;
      onPress: () => void;
    }) => (
      <Pressable accessibilityLabel={label} onPress={onPress}>
        {children}
      </Pressable>
    ),
  };
});
jest.mock('@/components/kev/ExamCard', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { ExamCard: ({ exam }: { exam: { course: string } }) => <Text>{exam.course}</Text> };
});
jest.mock('@/components/kev/people', () => ({ Avatar: () => null, personForId: () => 'me' }));

it('clears the active filter per lecturer but keeps cleared sessions searchable', () => {
  useClearedSessionsStore.setState({ byUser: {} });
  useAuthStore.setState({
    user: { id: 'lecturer-1', email: 'one@example.com', role: 'LECTURER', plan: 'FREE' },
  });
  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <HomeScreen />
    </SafeAreaProvider>,
  );

  fireEvent.press(screen.getByText('Past'));
  expect(screen.getByText('PAST 101')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Clear filtered sessions'));
  expect(screen.queryByText('PAST 101')).toBeNull();

  fireEvent.changeText(screen.getByTestId('home-search'), 'PAST');
  expect(screen.getByText('PAST 101')).toBeTruthy();

  fireEvent.changeText(screen.getByTestId('home-search'), '');
  act(() =>
    useAuthStore.setState({
      user: { id: 'lecturer-2', email: 'two@example.com', role: 'LECTURER', plan: 'FREE' },
    }),
  );
  expect(screen.getByText('PAST 101')).toBeTruthy();
});
