import { fireEvent, render } from '@testing-library/react-native';
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
    const { getByLabelText, getByPlaceholderText, getByText } = renderRoomSetupScreen();

    expect(getByText('Room Setup')).toBeTruthy();
    expect(getByLabelText('KEV logo')).toBeTruthy();
    expect(getByPlaceholderText('Active Session Code')).toBeTruthy();
    expect(getByText('Or')).toBeTruthy();
    expect(getByText('Swipe to create a new room')).toBeTruthy();
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
