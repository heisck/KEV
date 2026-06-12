import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

type RoomActionWordPatternProps = { color?: string; density?: 'edge' | 'full'; word: string };
type WordPlacement = {
  left: DimensionValue;
  rotate: string;
  size: number;
  top: DimensionValue;
  weight: '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
};

const MICRO_WEIGHTS = ['200', '400', '600', '800', '300', '700'] as const;
const BRICK_COLUMNS = 6;
const BRICK_ROWS = 18;

// Even, staggered "brick wall" of micro words covering the whole dark panel —
// defined rows instead of random scatter, while size/weight/style/case still vary.
function createBrickPlacements(): WordPlacement[] {
  const columnWidth = 100 / BRICK_COLUMNS;
  const rowHeight = 100 / BRICK_ROWS;
  const placements: WordPlacement[] = [];

  for (let row = 0; row < BRICK_ROWS; row += 1) {
    const stagger = row % 2 === 0 ? 0 : columnWidth / 2;

    for (let col = 0; col < BRICK_COLUMNS; col += 1) {
      const index = row * BRICK_COLUMNS + col;

      placements.push({
        left: `${col * columnWidth + stagger + 1.5}%`,
        rotate: '0deg',
        size: 6 + (index % 4),
        top: `${row * rowHeight + 1.5}%`,
        weight: MICRO_WEIGHTS[index % MICRO_WEIGHTS.length],
      });
    }
  }

  return placements;
}

const PLACEMENTS: WordPlacement[] = createBrickPlacements();

const EDGE_PLACEMENTS: WordPlacement[] = [
  { left: '4%', top: '12%', rotate: '0deg', size: 7, weight: '300' },
  { left: '18%', top: '64%', rotate: '0deg', size: 8, weight: '700' },
  { left: '34%', top: '28%', rotate: '0deg', size: 7, weight: '500' },
  { left: '49%', top: '72%', rotate: '0deg', size: 8, weight: '800' },
  { left: '63%', top: '18%', rotate: '0deg', size: 7, weight: '400' },
  { left: '79%', top: '58%', rotate: '0deg', size: 8, weight: '600' },
  { left: '93%', top: '24%', rotate: '0deg', size: 7, weight: '300' },
];

function getLabel(word: string, index: number) {
  if (index % 3 === 1) return word.toLowerCase();
  if (index % 3 === 2) return word[0] + word.slice(1).toLowerCase();
  return word;
}

export function RoomActionWordPattern({
  color = 'rgba(255,255,255,0.13)',
  density = 'full',
  word,
}: RoomActionWordPatternProps) {
  const placements = density === 'edge' ? EDGE_PLACEMENTS : PLACEMENTS;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {placements.map((placement, index) => (
        <Text
          key={`${word}-${index}`}
          style={[
            styles.word,
            {
              color,
              fontSize: placement.size,
              fontStyle: index % 2 ? 'italic' : 'normal',
              fontWeight: placement.weight,
              left: placement.left,
              top: placement.top,
              transform: [{ rotate: placement.rotate }],
            },
          ]}
        >
          {getLabel(word, index)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  word: {
    letterSpacing: 0,
    position: 'absolute',
  },
  wrap: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
