import { render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { useSettingsStore } from '@/store/settingsStore';
import { getPalette } from '@/theme/palette';

describe('date and time drawer', () => {
  beforeEach(() => useSettingsStore.setState({ theme: 'dark' }));

  it('uses a dark drawer surface for the iOS picker', () => {
    const { getByTestId } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 844, width: 390, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 },
        }}
      >
        <BottomDrawer onClose={jest.fn()} testID="picker-drawer" title="Exam date" visible>
          <Text>Picker</Text>
        </BottomDrawer>
      </SafeAreaProvider>,
    );
    const surface = getByTestId('picker-drawer-surface');
    expect(StyleSheet.flatten(surface.props.style).backgroundColor).toBe(getPalette(true).surface);
  });
});
