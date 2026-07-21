import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ReportsScreen } from '@/screens/kev/ReportsScreen';

jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@/api/hooks', () => ({
  useMarkReportRead: () => ({ mutate: jest.fn() }),
  useMarkReportsRead: () => ({ mutate: jest.fn() }),
  useReports: () => ({
    data: [
      {
        id: 1,
        sessionId: 2,
        sessionTitle: 'Algorithms',
        sessionCode: 'KEV-ABCD',
        examDate: null,
        authorId: '11111111-1111-1111-1111-111111111111',
        authorName: 'Rebecca',
        authorEmail: 'rebecca@example.com',
        student: null,
        message: 'General note',
        createdAt: new Date().toISOString(),
        read: false,
      },
    ],
    isLoading: false,
  }),
}));
jest.mock('@/components/reports/ReportCard', () => ({
  ReportCard: () => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text>Report card</Text>;
  },
}));
jest.mock('@/components/reports/ReportCreatePanel', () => ({
  ReportCreatePanel: () => {
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    return <View testID="report-composer" />;
  },
}));

function renderScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <ReportsScreen />
    </SafeAreaProvider>,
  );
}

it('keeps Create exclusive and allows Recent with only one read state', () => {
  const screen = renderScreen();
  const recent = screen.getByTestId('report-filter-recent');
  const unread = screen.getByTestId('report-filter-unread');
  const read = screen.getByTestId('report-filter-read');

  expect(recent.props.accessibilityState.selected).toBe(true);
  fireEvent.press(unread);
  expect(screen.getByLabelText('Mark filtered reports as read')).toBeTruthy();
  expect(recent.props.accessibilityState.selected).toBe(true);
  fireEvent.press(read);
  expect(screen.getByTestId('report-filter-unread').props.accessibilityState.selected).toBe(false);
  expect(screen.getByTestId('report-filter-read').props.accessibilityState.selected).toBe(true);

  fireEvent.press(screen.getByTestId('report-filter-create'));
  expect(screen.getByTestId('report-filter-create').props.accessibilityState.selected).toBe(true);
  expect(screen.getByTestId('report-filter-recent').props.accessibilityState.selected).toBe(false);
  expect(screen.getByTestId('report-filter-read').props.accessibilityState.selected).toBe(false);
  expect(screen.queryByLabelText('Mark filtered reports as read')).toBeNull();
  expect(screen.getByTestId('report-composer')).toBeTruthy();
});

it('renders compact report filter pills', () => {
  const screen = renderScreen();

  expect(StyleSheet.flatten(screen.getByTestId('report-filter-recent').props.style)).toEqual(
    expect.objectContaining({ flex: 1, height: 32 }),
  );
});
