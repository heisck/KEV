import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export type ArtKey = 'campus' | 'city' | 'harbor' | 'hall' | 'arena' | 'students';

type Art = { sky: [string, string]; ground: string; draw: React.ReactNode };

/**
 * Illustrated stand-ins for the mockup's photos (100×100 viewBox, stretched to
 * fill each slot). Drop licensed photos into assets/kev/ and swap here.
 */
const ART: Record<ArtKey, Art> = {
  campus: {
    sky: ['#F7C77E', '#C4699E'],
    ground: '#7A4C86',
    draw: (
      <>
        <Circle cx={72} cy={26} r={12} fill="#FFE8B8" opacity={0.9} />
        <Path
          d="M0 66h14V46l6-10 6 10v20h10V52h8l4-16 4 16h8v14h12V42l6-9 6 9v24h16v34H0V66Z"
          fill="#5A3A6E"
        />
        <Path d="M20 36v-9l-3 2v-4l9-6 9 6v4l-3-2v9" fill="#5A3A6E" />
        <Rect x={0} y={82} width={100} height={18} fill="#46295C" />
      </>
    ),
  },
  city: {
    sky: ['#A9C7EF', '#41519B'],
    ground: '#2B3568',
    draw: (
      <>
        <Circle cx={26} cy={22} r={9} fill="#FFF3F3" opacity={0.85} />
        <Path d="M18 78 50 30l32 48H18Z" fill="#5E6DB0" />
        <Path d="M42 42h16l-3 6-3-3-2 4-3-3-2 3-3-7Z" fill="#FFF" />
        <Path d="M0 84h10V64h8v20h8V70h8v14h32V72h8v12h8V60h8v24h10v16H0V84Z" fill="#232B58" />
      </>
    ),
  },
  harbor: {
    sky: ['#BFE0F5', '#5D8FD6'],
    ground: '#2E5FA8',
    draw: (
      <>
        <Circle cx={78} cy={22} r={10} fill="#FFF6D8" opacity={0.9} />
        <Path d="M12 74c2-16 12-26 26-28-8 8-10 16-10 28H12Z" fill="#F4F6F9" />
        <Path d="M32 74c2-18 14-30 30-32-9 9-12 19-12 32H32Z" fill="#FFF" />
        <Path d="M54 74c2-14 11-23 22-25-6 7-8 14-8 25H54Z" fill="#EDF1F6" />
        <Rect x={0} y={74} width={100} height={26} fill="#2E5FA8" />
        <Path d="M0 80c16-4 34-4 50 0s34 4 50 0v6H0v-6Z" fill="#4C7FC4" opacity={0.6} />
      </>
    ),
  },
  hall: {
    sky: ['#D8E3EE', '#8FA6BC'],
    ground: '#5A6C80',
    draw: (
      <>
        <Rect x={8} y={30} width={26} height={70} fill="#6E8298" />
        <Rect x={38} y={14} width={30} height={86} fill="#8DA2B8" />
        <Rect x={72} y={38} width={22} height={62} fill="#657A90" />
        {[0, 1, 2, 3, 4, 5].map((r) =>
          [0, 1, 2].map((c) => (
            <Rect
              key={`${r}-${c}`}
              x={42 + c * 8}
              y={20 + r * 12}
              width={5}
              height={7}
              fill="#DCE7F2"
              opacity={0.9}
            />
          )),
        )}
        <Rect x={0} y={92} width={100} height={8} fill="#3F4E60" />
      </>
    ),
  },
  arena: {
    sky: ['#CBE0F2', '#E9C98F'],
    ground: '#B08A55',
    draw: (
      <>
        <Ellipse cx={50} cy={92} rx={60} ry={14} fill="#8A6A3E" />
        <Path d="M8 84V40c12-10 30-16 42-16s30 6 42 16v44H8Z" fill="#D9B97F" />
        <Path
          d="M8 40c12-10 30-16 42-16s30 6 42 16v10c-12-9-30-14-42-14S20 41 8 50V40Z"
          fill="#C6A469"
        />
        {[14, 30, 46, 62, 78].map((x) => (
          <Path key={`a1-${x}`} d={`M${x} 84V62a5 5 0 0 1 10 0v22`} fill="#9C7A47" />
        ))}
        {[18, 34, 50, 66, 82].map((x) => (
          <Path key={`a2-${x}`} d={`M${x} 56v-8a4 4 0 0 1 8 0v8`} fill="#AD8A55" opacity={0.85} />
        ))}
      </>
    ),
  },
  students: {
    sky: ['#F6D8E7', '#C9A6E8'],
    ground: '#9C6BC9',
    draw: (
      <>
        <Circle cx={38} cy={38} r={12} fill="#F2C6A0" />
        <Circle cx={64} cy={42} r={11} fill="#E8B48C" />
        <Path d="M24 100c0-18 7-28 14-28s14 10 14 28" fill="#E560A2" />
        <Path d="M52 100c0-16 6-25 12-25s12 9 12 25" fill="#8F5BD1" />
        <Path
          d="M30 30c2-8 14-10 17 0 3-6 12-4 12 3l-4 5c-2-6-8-8-13-4-5-4-10-3-12-4Z"
          fill="#5C3A2E"
        />
        <Circle cx={30} cy={58} r={4} fill="#FFD35C" />
      </>
    ),
  },
};

/** Fills its parent; parent sets size + borderRadius (with overflow hidden). */
export function SceneArt({ art }: { art: ArtKey }) {
  const { sky, ground, draw } = ART[art];
  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id={`sky-${art}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={sky[0]} />
          <Stop offset="1" stopColor={sky[1]} />
        </LinearGradient>
      </Defs>
      <Rect width={100} height={100} fill={`url(#sky-${art})`} />
      {draw}
      <Rect x={0} y={96} width={100} height={4} fill={ground} />
    </Svg>
  );
}
