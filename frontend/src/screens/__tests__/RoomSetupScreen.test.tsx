import { act, fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RoomSetupScreen } from '@/screens/RoomSetupScreen';

function renderRoomSetupScreen() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <RoomSetupScreen />
    </SafeAreaProvider>,
  );
}

describe('RoomSetupScreen', () => {
  it('renders the collapsed session setup step', () => {
    const { getByLabelText, getByPlaceholderText, getByText, queryByLabelText } =
      renderRoomSetupScreen();

    expect(getByText('Home')).toBeTruthy();
    expect(getByLabelText('Open quick actions')).toBeTruthy();
    expect(getByLabelText('Search sessions')).toBeTruthy();
    expect(getByText('Session History')).toBeTruthy();
    expect(queryByLabelText('Close room setup')).toBeNull();
    expect(getByLabelText('KEV logo')).toBeTruthy();
    expect(getByLabelText('Expand room dock')).toBeTruthy();
    expect(getByPlaceholderText('Active Session Code')).toBeTruthy();
    expect(getByText('Or')).toBeTruthy();
    expect(getByText('Swipe to create a new room')).toBeTruthy();
  });

  it('toggles the session history strip', () => {
    const { getByLabelText, getByText, queryByText } = renderRoomSetupScreen();

    fireEvent.press(getByLabelText('Open quick actions'));
    expect(getByText('Notifications')).toBeTruthy();
    fireEvent.press(getByLabelText('Hide session history'));

    expect(queryByText('Session History')).toBeNull();

    fireEvent.press(getByLabelText('Open quick actions'));
    fireEvent.press(getByLabelText('Show session history'));
    expect(getByText('Session History')).toBeTruthy();
  });

  it('expands search into a session history input', () => {
    jest.useFakeTimers();
    const { getByLabelText, getByPlaceholderText, getByText, queryByText } =
      renderRoomSetupScreen();

    try {
      fireEvent.press(getByLabelText('Search sessions'));
      act(() => jest.runOnlyPendingTimers());

      expect(queryByText('Home')).toBeNull();
      expect(getByText('Search')).toBeTruthy();
      expect(getByPlaceholderText('session history')).toBeTruthy();
      expect(getByLabelText('Open quick actions')).toBeTruthy();
      expect(getByLabelText('Close session search')).toBeTruthy();
      expect(getByLabelText('Submit session search')).toBeTruthy();

      fireEvent.press(getByLabelText('Close session search'));
      act(() => jest.runOnlyPendingTimers());
      expect(getByText('Home')).toBeTruthy();
    } finally {
      jest.useRealTimers();
    }
  });

  it('expands the floating dock icons without opening extra panels', () => {
    const { getByLabelText, queryByText } = renderRoomSetupScreen();

    fireEvent.press(getByLabelText('Expand room dock'));

    expect(getByLabelText('Open home dock')).toBeTruthy();
    expect(getByLabelText('Open profile dock')).toBeTruthy();
    expect(queryByText('Active Session')).toBeNull();
    expect(queryByText('Contributors')).toBeNull();
  });

  it('expands into new room setup', () => {
    const { getByLabelText, getByPlaceholderText, getByText, queryByPlaceholderText } =
      renderRoomSetupScreen();

    fireEvent.press(getByLabelText('Swipe to create a new room'));

    expect(getByText('New Room Setup')).toBeTruthy();
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

    fireEvent.press(getByLabelText('Swipe to create a new room'));
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

    fireEvent.press(getByLabelText('Swipe to create a new room'));
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
