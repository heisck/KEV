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

export type RoomIconName = 'arrowUp' | 'back' | 'close' | 'minus' | 'plus' | 'send';
type ButtonProps = { icon: RoomIconName; label: string; onPress?: () => void };

const ICON_PATHS: Record<RoomIconName, string> = {
  arrowUp: 'M6 15l6-6 6 6',
  back: 'M19 12H5M12 19l-7-7 7-7',
  close: 'M6 6l12 12M18 6 6 18',
  minus: 'M5 12h14',
  plus: 'M12 5v14M5 12h14',
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
