import { fireEvent, render } from '@testing-library/react-native';

import { SettingToggle } from '@/components/settings/SettingsControls';

it('uses the native switch value-change event', () => {
  const onToggle = jest.fn();
  const screen = render(
    <SettingToggle value={false} onToggle={onToggle} testID="native-setting-toggle" />,
  );

  fireEvent(screen.getByTestId('native-setting-toggle'), 'valueChange', true);

  expect(onToggle).toHaveBeenCalledTimes(1);
});
