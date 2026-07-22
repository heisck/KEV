import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { ReportCreatePanel } from '@/components/reports/ReportCreatePanel';
import { getPalette } from '@/theme/palette';

const mockCreateReport = jest.fn(async () => undefined);
const mockSendAction = jest.fn();
const mockCommand = jest.fn();

jest.mock('react-native-pell-rich-editor', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { TextInput } = jest.requireActual<typeof import('react-native')>('react-native');
  const RichEditor = React.forwardRef(
    (
      props: {
        disabled?: boolean;
        editorInitializedCallback?: () => void;
        initialContentHTML?: string;
        onChange?: (value: string) => void;
        placeholder?: string;
        testID?: string;
      },
      ref,
    ) => {
      const { editorInitializedCallback } = props;
      React.useImperativeHandle(ref, () => ({
        blurContentEditor: jest.fn(),
        command: mockCommand,
        focusContentEditor: jest.fn(),
        registerToolbar: jest.fn(),
        sendAction: mockSendAction,
        setContentHTML: jest.fn(),
      }));
      React.useEffect(() => editorInitializedCallback?.(), [editorInitializedCallback]);
      return (
        <TextInput
          editable={!props.disabled}
          onChangeText={props.onChange}
          placeholder={props.placeholder}
          testID={props.testID}
          value={props.initialContentHTML}
        />
      );
    },
  );
  RichEditor.displayName = 'MockRichEditor';
  return {
    RichEditor,
    actions: {
      alignLeft: 'justifyLeft',
      alignRight: 'justifyRight',
      insertBulletsList: 'unorderedList',
      insertOrderedList: 'orderedList',
      setBold: 'bold',
      setItalic: 'italic',
      setStrikethrough: 'strikeThrough',
      setUnderline: 'underline',
    },
  };
});

jest.mock('@/api/hooks', () => ({
  useCreateReport: () => ({ isPending: false, mutateAsync: mockCreateReport }),
  useSessions: () => ({
    data: [{ id: 9, joined: false, sessionCode: 'KEV-OPEN', title: 'Open session' }],
  }),
}));

describe('ReportCreatePanel', () => {
  beforeEach(() => {
    mockCommand.mockClear();
    mockCreateReport.mockClear();
    mockSendAction.mockClear();
  });

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

  it('keeps the Go action out of the editor layout', () => {
    const screen = render(<ReportCreatePanel onSendingChange={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-compose-action'));
    fireEvent.changeText(screen.getByPlaceholderText('Write your report…'), 'Room issue');
    fireEvent.press(screen.getByTestId('report-format-align-right'));

    expect(screen.queryByLabelText('Hide keyboard')).toBeNull();
    expect(screen.getByTestId('report-format-toolbar').props.keyboardShouldPersistTaps).toBe(
      'always',
    );
    expect(screen.getByTestId('report-list-icon-numbered-list')).toBeTruthy();
  });

  it('persists visual formatting without showing the markers in the editor', async () => {
    const screen = render(<ReportCreatePanel onSendingChange={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-compose-action'));
    fireEvent.changeText(
      screen.getByPlaceholderText('Write your report…'),
      '<div><b>Room</b> issue</div>',
    );
    fireEvent.press(screen.getByTestId('report-compose-action'));

    await waitFor(() =>
      expect(mockCreateReport).toHaveBeenCalledWith({
        message: '**Room** issue',
        sessionId: 9,
      }),
    );
  });

  it('sends selection-aware formatting commands to the editor', async () => {
    const screen = render(<ReportCreatePanel onSendingChange={jest.fn()} />);

    fireEvent.press(screen.getByTestId('report-compose-action'));
    fireEvent.press(screen.getByTestId('report-format-bold'));

    await waitFor(() => expect(mockSendAction).toHaveBeenCalledWith('bold', 'result'));
  });
});
