import { useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';

type RoomImageMosaicProps = {
  height: number;
  imageUris: string[];
  revealProgress: Animated.Value;
  width: number;
};
type MosaicTile = {
  height: number;
  left: number;
  revealRank: number;
  scale: number;
  top: number;
  width: number;
};
type MosaicRow = { height: number; scale: number; top: number; widths: number[] };

function getSeed(index: number) {
  const value = Math.sin((index + 1) * 12.9898 + 78.233) * 43758.5453;

  return value - Math.floor(value);
}

function addRevealRanks(tiles: Omit<MosaicTile, 'revealRank'>[]): MosaicTile[] {
  const ordered = tiles.map((_, index) => index).sort((a, b) => getSeed(a) - getSeed(b));
  const ranks = ordered.reduce<number[]>((result, tileIndex, rank) => {
    result[tileIndex] = rank;
    return result;
  }, []);

  return tiles.map((tile, index) => ({ ...tile, revealRank: ranks[index] }));
}

function createTiles(rows: MosaicRow[]): MosaicTile[] {
  const tiles = rows.flatMap((row, rowIndex) => {
    let left = 0;

    return row.widths.map((width, tileIndex) => {
      const tile = {
        height: row.height,
        left,
        scale: row.scale + ((rowIndex + tileIndex) % 3) * 0.012,
        top: row.top,
        width,
      };

      left += width;
      return tile;
    });
  });

  return addRevealRanks(tiles);
}

const SMALL_TILES = createTiles([
  { height: 0.38, scale: 1.09, top: 0, widths: [0.58, 0.42] },
  { height: 0.27, scale: 1.08, top: 0.38, widths: [0.28, 0.44, 0.28] },
  { height: 0.2, scale: 1.07, top: 0.65, widths: [0.22, 0.26, 0.24, 0.28] },
  { height: 0.15, scale: 1.06, top: 0.85, widths: [0.28, 0.22, 0.3, 0.2] },
]);

const MEDIUM_TILES = createTiles([
  { height: 0.34, scale: 1.1, top: 0, widths: [0.4, 0.28, 0.32] },
  { height: 0.27, scale: 1.09, top: 0.34, widths: [0.22, 0.31, 0.19, 0.28] },
  { height: 0.22, scale: 1.08, top: 0.61, widths: [0.18, 0.24, 0.17, 0.23, 0.18] },
  { height: 0.17, scale: 1.06, top: 0.83, widths: [0.16, 0.18, 0.16, 0.17, 0.15, 0.18] },
]);

const LARGE_TILES = createTiles([
  { height: 0.3, scale: 1.11, top: 0, widths: [0.38, 0.25, 0.37] },
  { height: 0.25, scale: 1.1, top: 0.3, widths: [0.22, 0.28, 0.21, 0.29] },
  { height: 0.2, scale: 1.08, top: 0.55, widths: [0.16, 0.21, 0.18, 0.2, 0.25] },
  { height: 0.15, scale: 1.07, top: 0.75, widths: [0.14, 0.18, 0.15, 0.16, 0.17, 0.2] },
  {
    height: 0.1,
    scale: 1.06,
    top: 0.9,
    widths: [0.11, 0.14, 0.12, 0.13, 0.1, 0.14, 0.11, 0.15],
  },
]);

function getTiles(width: number) {
  if (width >= 560) return LARGE_TILES;
  if (width >= 360) return MEDIUM_TILES;
  return SMALL_TILES;
}

function getTileStyle(tile: MosaicTile, width: number, height: number): ViewStyle {
  return {
    height: Math.ceil(tile.height * height) + 1,
    left: Math.floor(tile.left * width),
    top: Math.floor(tile.top * height),
    width: Math.ceil(tile.width * width) + 1,
  };
}

function getImageStyle(tile: MosaicTile, isActive: boolean): ImageStyle {
  return { transform: [{ scale: tile.scale + (isActive ? 0.06 : 0) }] };
}

function getGutterOpacity(revealProgress: Animated.Value) {
  return revealProgress.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, 0.08, 0.24, 1],
    outputRange: [1, 0.55, 0, 0],
  });
}

function getTileOpacity(revealProgress: Animated.Value, tile: MosaicTile, tileCount: number) {
  const step = 0.82 / Math.max(tileCount - 1, 1);
  const start = 0.04 + tile.revealRank * step;
  const end = Math.min(start + 0.2, 1);

  return revealProgress.interpolate({
    extrapolate: 'clamp',
    inputRange: [0, start, end, 1],
    outputRange: [1, 1, 0, 0],
  });
}

export function RoomImageMosaic({
  height,
  imageUris,
  revealProgress,
  width,
}: RoomImageMosaicProps) {
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const tiles = getTiles(width).slice(0, imageUris.length);

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <Animated.View
        pointerEvents="none"
        style={[styles.gutterLayer, { opacity: getGutterOpacity(revealProgress) }]}
      />
      {tiles.map((tile, index) => {
        const isActive = activeTile === index;

        return (
          <Pressable
            accessibilityLabel={`Student image ${index + 1}`}
            accessibilityRole="imagebutton"
            key={`${tile.left}-${tile.top}`}
            onHoverIn={() => setActiveTile(index)}
            onHoverOut={() => setActiveTile(null)}
            onPress={() => setActiveTile(index)}
            style={[styles.tile, getTileStyle(tile, width, height), isActive && styles.activeTile]}
          >
            <Animated.View
              style={[
                styles.imageShell,
                { opacity: getTileOpacity(revealProgress, tile, tiles.length) },
              ]}
            >
              <Image
                accessibilityIgnoresInvertColors
                resizeMode="cover"
                source={{ uri: imageUris[index] }}
                style={[styles.image, getImageStyle(tile, isActive)]}
              />
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTile: { zIndex: 2 },
  gutterLayer: {
    backgroundColor: '#FFFFFF',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  image: { height: '100%', width: '100%' },
  imageShell: {
    bottom: 0.8,
    left: 0.8,
    position: 'absolute',
    right: 0.8,
    top: 0.8,
  },
  tile: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'absolute',
  },
  wrap: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
});
