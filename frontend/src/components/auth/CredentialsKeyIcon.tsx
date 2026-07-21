import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export function CredentialsKeyIcon({
  color,
  surface,
  outline,
}: {
  color: string;
  surface: string;
  outline: string;
}) {
  return (
    <Svg height={112} testID="credentials-key-icon" viewBox="0 0 112 112" width={112}>
      <Defs>
        <LinearGradient id="key-surface" x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0" stopColor={surface} stopOpacity={0.35} />
          <Stop offset="1" stopColor={surface} stopOpacity={0.95} />
        </LinearGradient>
      </Defs>
      <Circle
        cx={56}
        cy={56}
        fill="none"
        r={50}
        stroke={outline}
        strokeDasharray="1 5"
        strokeLinecap="round"
        strokeWidth={1.5}
      />
      <Circle cx={56} cy={56} fill="url(#key-surface)" r={34} stroke={outline} strokeWidth={1} />
      <Circle cx={40} cy={56} fill="none" r={10} stroke={color} strokeWidth={2.2} />
      <Circle cx={40} cy={56} fill="none" r={3} stroke={color} strokeWidth={1.8} />
      <Path
        d="M50 56h33m-7 0v7m-8-7v5"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
      />
    </Svg>
  );
}
