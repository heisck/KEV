import { Image, type ImageStyle } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, type StyleProp } from 'react-native';

import { getSessionArtworkUrl, type SessionArtworkVariant } from '@/data/sessionArtwork';

const LOCAL_FALLBACK = require('../../../assets/images/campus-glass-building-close.jpg');

/** Optimized Cloudinary session art with the repository asset as an offline fallback. */
export function SessionArtwork({
  variant = 'thumbnail',
  seed,
  style,
}: {
  variant?: SessionArtworkVariant;
  seed?: string;
  style?: StyleProp<ImageStyle>;
}) {
  const [failed, setFailed] = useState(false);
  const source = failed ? LOCAL_FALLBACK : { uri: getSessionArtworkUrl(variant, seed) };

  return (
    <Image
      cachePolicy="memory-disk"
      contentFit="cover"
      onError={() => setFailed(true)}
      source={source}
      style={[styles.image, style]}
      transition={180}
    />
  );
}

const styles = StyleSheet.create({ image: { height: '100%', width: '100%' } });
