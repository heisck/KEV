import { act, fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RoomSetupScreen } from '@/screens/RoomSetupScreen';

function renderRoomSetupScreen(onComplete = jest.fn()) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <RoomSetupScreen onComplete={onComplete} />
    </SafeAreaProvider>,
  );
}

function tapCreateRoom(getByLabelText: ReturnType<typeof renderRoomSetupScreen>['getByLabelText']) {
  fireEvent.press(getByLabelText('Tap to create room'));
  act(() => jest.runOnlyPendingTimers());
}

describe('RoomSetupScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the collapsed session setup step', () => {
    const { getAllByText, getByLabelText, getByText, queryByPlaceholderText, queryByText } =
      renderRoomSetupScreen();

    expect(getAllByText('NEW').length).toBeGreaterThan(0);
    expect(getByText('ROOM')).toBeTruthy();
    expect(getByText('SESSION')).toBeTruthy();
    expect(getByText('Tap to create room')).toBeTruthy();
    expect(getByLabelText('Tap to create room')).toBeTruthy();
    expect(getByLabelText('Open reminder menu')).toBeTruthy();
    expect(getByLabelText('Next reminder')).toBeTruthy();
    expect(queryByPlaceholderText('Active Session Code')).toBeNull();
    expect(queryByText('Swipe to create a new room')).toBeNull();
  });

  it('toggles the bottom control between new room and active session modes', () => {
    const { getByDisplayValue, getByLabelText, getByPlaceholderText, getByText, queryByText } =
      renderRoomSetupScreen();

    fireEvent.press(getByLabelText('Use active room mode'));
    fireEvent.changeText(getByPlaceholderText('Active room session'), '482913');

    expect(getByDisplayValue('482913')).toBeTruthy();
    expect(getByLabelText('Send active room session')).toBeTruthy();
    expect(queryByText('Tap to create room')).toBeNull();

    fireEvent.press(getByLabelText('Use new room mode'));
    expect(getByText('Tap to create room')).toBeTruthy();
  });

  it('uses the chevron as a collapsed slider fallback', () => {
    const { getByLabelText, getByPlaceholderText } = renderRoomSetupScreen();

    fireEvent.press(getByLabelText('Next reminder'));
    act(() => jest.runOnlyPendingTimers());

    expect(getByPlaceholderText('Building or College')).toBeTruthy();
  });

  it('continues from active session send', () => {
    const onComplete = jest.fn();
    const { getByLabelText, getByPlaceholderText } = renderRoomSetupScreen(onComplete);

    fireEvent.press(getByLabelText('Use active room mode'));
    fireEvent.changeText(getByPlaceholderText('Active room session'), '482913');
    fireEvent.press(getByLabelText('Send active room session'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('continues from the new room save action', () => {
    const onComplete = jest.fn();
    const { getByLabelText } = renderRoomSetupScreen(onComplete);

    tapCreateRoom(getByLabelText);
    fireEvent.press(getByLabelText('Save and continue'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('expands into new room setup', () => {
    const { getByLabelText, getByPlaceholderText, getByText, queryByPlaceholderText, queryByText } =
      renderRoomSetupScreen();

    tapCreateRoom(getByLabelText);

    expect(getByLabelText('Collapse room setup')).toBeTruthy();
    expect(queryByText('New Room Setup')).toBeNull();
    expect(queryByPlaceholderText('Active Session Code')).toBeNull();
    expect(getByPlaceholderText('Building or College')).toBeTruthy();
    expect(getByPlaceholderText('Room Number')).toBeTruthy();
    expect(getByPlaceholderText('Course Code')).toBeTruthy();
    fireEvent.press(getByLabelText('Increase floor'));
    expect(getByText('1F')).toBeTruthy();
    expect(getByPlaceholderText('Index From')).toBeTruthy();
  });

  it('adds index range chips', () => {
    const { getByLabelText, getByPlaceholderText, getByText, queryByDisplayValue } =
      renderRoomSetupScreen();

    tapCreateRoom(getByLabelText);
    fireEvent.changeText(getByPlaceholderText('Index From'), '1001');
    fireEvent.changeText(getByPlaceholderText('Index To'), '1040');
    fireEvent.changeText(getByPlaceholderText('Course Code'), 'MATH 101');
    fireEvent.press(getByLabelText('Add course range'));

    expect(getByText('1001-1040 MATH 101')).toBeTruthy();
    expect(queryByDisplayValue('1001')).toBeNull();
    expect(queryByDisplayValue('1040')).toBeNull();
    expect(queryByDisplayValue('MATH 101')).toBeNull();
  });

  it('removes a course chip without refilling inputs', () => {
    const { getByLabelText, getByPlaceholderText, queryByDisplayValue, queryByText } =
      renderRoomSetupScreen();

    tapCreateRoom(getByLabelText);
    fireEvent.changeText(getByPlaceholderText('Index From'), '1001');
    fireEvent.changeText(getByPlaceholderText('Index To'), '1040');
    fireEvent.changeText(getByPlaceholderText('Course Code'), 'MATH 101');
    fireEvent.press(getByLabelText('Add course range'));
    fireEvent.press(getByLabelText('Remove 1001-1040 MATH 101'));

    expect(queryByText('1001-1040 MATH 101')).toBeNull();
    expect(queryByDisplayValue('1001')).toBeNull();
    expect(queryByDisplayValue('1040')).toBeNull();
    expect(queryByDisplayValue('MATH 101')).toBeNull();
  });
});
