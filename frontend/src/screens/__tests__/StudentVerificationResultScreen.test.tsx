import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StudentVerificationResultScreen } from '@/screens/StudentVerificationResultScreen';

function renderResultScreen(props: Parameters<typeof StudentVerificationResultScreen>[0] = {}) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 },
      }}
    >
      <StudentVerificationResultScreen {...props} />
    </SafeAreaProvider>,
  );
}

describe('StudentVerificationResultScreen', () => {
  it('renders verified student details', () => {
    const { getByLabelText, getByText } = renderResultScreen();

    expect(getByText('Student verified')).toBeTruthy();
    expect(getByLabelText('Ama Serwaa Mensah photo')).toBeTruthy();
    expect(getByText('Add to class')).toBeTruthy();
  });

  it('toggles class membership action', () => {
    const onAddToClass = jest.fn();
    const { getByText } = renderResultScreen({ onAddToClass });

    fireEvent.press(getByText('Add to class'));

    expect(onAddToClass).toHaveBeenCalledTimes(1);
    expect(getByText('Remove from class')).toBeTruthy();
  });

  it('renders remove action when the student is already in class', () => {
    const onRemoveFromClass = jest.fn();
    const { getByText } = renderResultScreen({ initialInClass: true, onRemoveFromClass });

    fireEvent.press(getByText('Remove from class'));

    expect(onRemoveFromClass).toHaveBeenCalledTimes(1);
    expect(getByText('Add to class')).toBeTruthy();
  });
});
