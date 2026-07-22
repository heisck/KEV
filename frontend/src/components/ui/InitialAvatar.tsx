import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

type InitialAvatarProps = {
  /** Photo to show; when absent the first initial of `seed` is rendered instead. */
  uri?: string | null;
  /** Source string whose first character (uppercased) is used as the fallback initial. */
  seed: string;
  imageStyle: StyleProp<ImageStyle>;
  fallbackStyle: StyleProp<ViewStyle>;
  initialStyle: StyleProp<TextStyle>;
};

/** Round avatar: the user's photo when available, otherwise their initial on a colored disc. */
export function InitialAvatar({
  uri,
  seed,
  imageStyle,
  fallbackStyle,
  initialStyle,
}: InitialAvatarProps) {
  if (uri) {
    return <Image source={{ uri }} style={imageStyle} contentFit="cover" />;
  }
  return (
    <View style={fallbackStyle}>
      <Text style={initialStyle}>{seed.charAt(0).toUpperCase()}</Text>
    </View>
  );
}
