import {
  Pressable,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { roomSetupStyles as styles } from '@/screens/roomSetupStyles';

export type RoomIconName =
  | 'arrowUp'
  | 'back'
  | 'bell'
  | 'close'
  | 'history'
  | 'home'
  | 'minus'
  | 'more'
  | 'profile'
  | 'plus'
  | 'search'
  | 'send';
type ButtonProps = { icon: RoomIconName; label: string; onPress?: () => void };

const ICON_PATHS: Record<RoomIconName, string> = {
  arrowUp: 'M6 15l6-6 6 6',
  back: 'M19 12H5M12 19l-7-7 7-7',
  bell: 'M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  close: 'M6 6l12 12M18 6 6 18',
  history: 'M12 8v5l3 2M5 5v5h5M5.6 14a7 7 0 1 0 1.8-7',
  home: 'M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z',
  minus: 'M5 12h14',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  plus: 'M12 5v14M5 12h14',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 21a7.5 7.5 0 0 1 15 0',
  search: 'M21 21l-4.5-4.5M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z',
  send: 'M3.5 5.5 21 12 3.5 18.5 8 12 3.5 5.5ZM8 12h13',
};

export function RoomIcon({
  color = '#0C2A1C',
  name,
  size = 20,
  strokeWidth = 2,
}: {
  color?: string;
  name: RoomIconName;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d={ICON_PATHS[name]}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export function CircleButton({ hidden, icon, label, onPress }: ButtonProps & { hidden?: boolean }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={hidden}
      onPress={onPress}
      style={[styles.circleButton, hidden && styles.hidden]}
    >
      <RoomIcon name={icon} size={18} strokeWidth={2.2} />
    </Pressable>
  );
}

export function Field({
  keyboardType = 'default',
  onChangeText,
  placeholder,
  style,
  value,
}: {
  keyboardType?: KeyboardTypeOptions;
  onChangeText: (value: string) => void;
  placeholder: string;
  style?: StyleProp<TextStyle>;
  value: string;
}) {
  return (
    <TextInput
      autoCorrect={false}
      disableFullscreenUI
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#667085"
      selectionColor="#10231D"
      style={[styles.input, style]}
      underlineColorAndroid="transparent"
      value={value}
    />
  );
}

export function RoundAction({
  icon,
  label,
  onPress,
  tone = 'primary',
}: ButtonProps & { tone?: 'muted' | 'primary' }) {
  const color = tone === 'muted' ? '#344054' : '#FFFFFF';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.roundAction, tone === 'muted' && styles.mutedAction]}
    >
      <RoomIcon color={color} name={icon} size={24} strokeWidth={2.4} />
    </Pressable>
  );
}

export function SendBadgeIcon() {
  return (
    <View style={styles.saveIcon}>
      <RoomIcon color="#FFFFFF" name="send" size={18} strokeWidth={2.1} />
    </View>
  );
}
