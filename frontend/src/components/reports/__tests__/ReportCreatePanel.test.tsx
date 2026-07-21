import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ReportCreatePanel } from '@/components/reports/ReportCreatePanel';
import { getPalette } from '@/theme/palette';

const mockCreateReport = jest.fn(async () => undefined);

jest.mock('@/api/hooks', () => ({
  useCreateReport: () => ({ isPending: false, mutateAsync: mockCreateReport }),
  useSessions: () => ({
    data: [{ id: 9, joined: false, sessionCode: 'KEV-OPEN', title: 'Open session' }],
  }),
}));

describe('ReportCreatePanel', () => {
  beforeEach(() => mockCreateReport.mockClear());

  it('allows reports for sessions the lecturer has not joined', () => {
    const screen = render(<ReportCreatePanel onSendingChange={jest.fn()} />);

    expect(screen.getByText('Open session')).toBeTruthy();
    expect(screen.queryByText('Join a session before creating a report.')).toBeNull();
  });

  it('fills the selected formatting section', () => {
    const screen = render(<ReportCreatePanel onSendingChange={jest.fn()} />);
    const bold = screen.getByTestId('report-format-bold');

    fireEvent.press(bold);

    expect(screen.getByTestId('report-format-bold').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('report-format-bold').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: getPalette(false).primary }),
      ]),
    );
    expect(screen.getByPlaceholderText('Write your report…').props.value).toBe('');
  });

  it('formats visually without exposing markup and provides a keyboard done action', () => {
    const screen = render(<ReportCreatePanel onSendingChange={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-compose-action'));
    fireEvent.changeText(screen.getByPlaceholderText('Write your report…'), 'Room issue');
    fireEvent.press(screen.getByTestId('report-format-align-right'));

    expect(screen.getByDisplayValue('Room issue')).toBeTruthy();
    expect(screen.queryByDisplayValue('<right>Room issue</right>')).toBeNull();
    expect(screen.getByLabelText('Hide keyboard')).toBeTruthy();
    expect(screen.getByTestId('report-format-toolbar').props.keyboardShouldPersistTaps).toBe(
      'always',
    );
    expect(screen.getByTestId('report-list-icon-numbered-list')).toBeTruthy();
  });

  it('persists visual formatting without showing the markers in the editor', async () => {
    const screen = render(<ReportCreatePanel onSendingChange={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-compose-action'));
    fireEvent.changeText(screen.getByPlaceholderText('Write your report…'), 'Room issue');
    fireEvent.press(screen.getByTestId('report-format-bold'));
    expect(screen.getByDisplayValue('Room issue')).toBeTruthy();
    fireEvent.press(screen.getByTestId('report-compose-action'));

    await waitFor(() =>
      expect(mockCreateReport).toHaveBeenCalledWith({
        message: '**Room issue**',
        sessionId: 9,
      }),
    );
  });
});
