import { Switch } from 'react-native';

import { usePalette } from '@/theme';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
};

/** React Native maps this component directly to Apple's native UISwitch. */
export function NativePreferenceSwitch({ value, onValueChange, testID }: Props) {
  const p = usePalette();
  return (
    <Switch
      ios_backgroundColor={p.mintDeep}
      onValueChange={onValueChange}
      testID={testID}
      trackColor={{ false: p.mintDeep, true: p.primary }}
      value={value}
    />
  );
}
