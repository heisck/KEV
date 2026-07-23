import { Switch } from 'react-native';

import { usePalette } from '@/theme';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
};

/** Platform-native switch fallback for Android and web. */
export function NativePreferenceSwitch({ value, onValueChange, disabled, testID }: Props) {
  const p = usePalette();
  return (
    <Switch
      disabled={disabled}
      ios_backgroundColor={p.mintDeep}
      onValueChange={onValueChange}
      testID={testID}
      trackColor={{ false: p.mintDeep, true: p.primary }}
      value={value}
    />
  );
}
