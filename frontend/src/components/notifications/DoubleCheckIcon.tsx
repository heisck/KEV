import Svg, { Path } from 'react-native-svg';

export function DoubleCheckIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="m3.5 12 4 4 7-8"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
      />
      <Path
        d="m9.5 16 2 2 9-10"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.9}
      />
    </Svg>
  );
}
