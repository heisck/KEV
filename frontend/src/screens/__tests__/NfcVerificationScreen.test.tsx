import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NfcVerificationScreen } from '@/screens/NfcVerificationScreen';

function renderNfcVerificationScreen(props: Parameters<typeof NfcVerificationScreen>[0] = {}) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <NfcVerificationScreen {...props} />
    </SafeAreaProvider>,
  );
}

describe('NfcVerificationScreen', () => {
  it('renders the NFC verification prompt', () => {
    const { queryByLabelText, getByText } = renderNfcVerificationScreen();

    expect(queryByLabelText('KEV logo')).toBeNull();
    expect(getByText('Verification')).toBeTruthy();
    expect(getByText('Created room ID')).toBeTruthy();
    expect(getByText('482913')).toBeTruthy();
    expect(getByText('Ready to Tap')).toBeTruthy();
    expect(getByText('MANUAL ENTRY')).toBeTruthy();
    expect(getByText('FACE RECOGNITION')).toBeTruthy();
  });

  it('handles close and manual entry submit actions', () => {
    const onClose = jest.fn();
    const onManualSubmit = jest.fn();
    const { getByLabelText, getByPlaceholderText, getByText } = renderNfcVerificationScreen({
      onClose,
      onManualSubmit,
    });

    fireEvent.press(getByLabelText('Close NFC verification'));
    fireEvent.press(getByLabelText('Manual entry'));
    fireEvent.changeText(getByPlaceholderText('Enter index number or student ID'), ' 1001 ');
    fireEvent.press(getByText('Submit'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onManualSubmit).toHaveBeenCalledWith('1001');
  });

  it('opens the face recognition camera surface', () => {
    const onFaceCapture = jest.fn();
    const { getByLabelText, getByText } = renderNfcVerificationScreen({ onFaceCapture });

    fireEvent.press(getByLabelText('Use face recognition'));

    expect(getByText('Face Recognition')).toBeTruthy();
    fireEvent.press(getByLabelText('Send face recognition capture'));
    expect(onFaceCapture).toHaveBeenCalledTimes(1);
  });

  it('handles the NFC scan success action', () => {
    const onNfcScan = jest.fn();
    const { getByLabelText } = renderNfcVerificationScreen({ onNfcScan });

    fireEvent.press(getByLabelText('Simulate NFC scan'));

    expect(onNfcScan).toHaveBeenCalledTimes(1);
  });
});
