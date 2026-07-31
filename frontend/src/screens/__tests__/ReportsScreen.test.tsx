import { fireEvent, render } from '@testing-library/react-native';
import { Keyboard, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ReportsScreen } from '@/screens/kev/ReportsScreen';

const mockMarkReportRead = jest.fn();
const mockBlurComposer = jest.fn();
let mockReportParam: string | undefined;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ report: mockReportParam }),
  useRouter: () => ({ back: jest.fn() }),
}));
jest.mock('@/api/hooks', () => ({
  useMarkReportRead: () => ({ mutate: mockMarkReportRead }),
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
  ReportCreatePanel: jest.requireActual<typeof import('react')>('react').forwardRef((_, ref) => {
    const React = jest.requireActual<typeof import('react')>('react');
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');
    React.useImperativeHandle(ref, () => ({ blur: mockBlurComposer }));
    return <View testID="report-composer" />;
  }),
}));
jest.mock('@/components/reports/ReportDetailDrawer', () => ({
  ReportDetailDrawer: ({ report }: { report: { id: number } | null }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return report ? <Text testID="report-detail">Report {report.id}</Text> : null;
  },
}));

beforeEach(() => {
  mockMarkReportRead.mockClear();
  mockBlurComposer.mockClear();
  mockReportParam = undefined;
});

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

it('opens and marks a report from a notification deep link', () => {
  mockReportParam = '1';

  const screen = renderScreen();

  expect(screen.getByTestId('report-detail')).toHaveTextContent('Report 1');
  expect(mockMarkReportRead).toHaveBeenCalledWith(1);
});

it('dismisses the report keyboard when empty screen space is pressed', () => {
  const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => undefined);
  const screen = renderScreen();

  fireEvent.press(screen.getByTestId('report-filter-create'));
  fireEvent.press(screen.getByTestId('reports-screen'));

  expect(dismiss).toHaveBeenCalled();
  expect(mockBlurComposer).toHaveBeenCalled();
  dismiss.mockRestore();
});
