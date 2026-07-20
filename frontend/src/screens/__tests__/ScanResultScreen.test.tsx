import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Image, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ScanResultScreen } from '@/screens/kev/ScanResultScreen';
import { useSessionStore } from '@/store/sessionStore';

const mockBack = jest.fn();
const mockRemove = jest.fn();
const mockParams: {
  attendance?: string;
  exam: string;
  method: string;
  mode?: string;
  status: string;
  student: string;
} = {
  exam: '1',
  method: 'NFC',
  status: 'already',
  student: '7',
};
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => ({ back: mockBack, replace: jest.fn() }),
}));
jest.mock('@/api/hooks', () => ({
  useRemoveAttendance: () => ({ isPending: false, mutateAsync: mockRemove }),
  useSessionDetail: () => ({ data: undefined }),
}));

beforeEach(() => {
  mockParams.status = 'already';
  delete mockParams.attendance;
  delete mockParams.mode;
  mockBack.mockReset();
  mockRemove.mockReset();
  mockRemove.mockResolvedValue(undefined);
  useSessionStore.setState({ roster: {} });
});

it('shows a readable duplicate-class result with equal-height actions', () => {
  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <ScanResultScreen />
    </SafeAreaProvider>,
  );

  expect(screen.getByText('Student already in this class')).toBeTruthy();
  const closeStyle = StyleSheet.flatten(screen.getByTestId('result-close').props.style);
  const nextStyle = StyleSheet.flatten(screen.getByTestId('result-scan-again').props.style);
  expect(closeStyle.height).toBe(56);
  expect(nextStyle.height).toBe(56);
});

it('uses the scanned student avatar without offering to add them again', () => {
  mockParams.status = 'added';
  useSessionStore.getState().addStudent('1', {
    id: '7',
    name: 'Ama Boateng',
    person: 'https://example.com/ama.jpg',
    index: '10953001',
    course: 'BSc CS',
  });

  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <ScanResultScreen />
    </SafeAreaProvider>,
  );

  expect(screen.queryByText('Add to class')).toBeNull();
  expect(screen.UNSAFE_getByType(Image).props.source).toEqual({
    uri: 'https://example.com/ama.jpg',
  });
});

it('uses back and remove actions when opened as a roster profile', async () => {
  mockParams.attendance = '8';
  mockParams.mode = 'profile';
  mockParams.status = 'added';
  useSessionStore.getState().addStudent('1', {
    id: '7',
    name: 'Ama Boateng',
    person: 'https://example.com/ama.jpg',
    index: '10953001',
    course: 'BSc CS',
  });

  const screen = render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <ScanResultScreen />
    </SafeAreaProvider>,
  );

  fireEvent.press(screen.getByLabelText('Back to session'));
  expect(mockBack).toHaveBeenCalled();
  fireEvent.press(screen.getByText('Remove from class'));
  await waitFor(() => expect(mockRemove).toHaveBeenCalledWith(8));
});
