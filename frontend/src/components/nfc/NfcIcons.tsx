import Svg, { Circle, Path, Rect } from 'react-native-svg';

type NfcIconProps = {
  color?: string;
  size?: number;
};

// Framed NFC tag with nested contactless waves — deliberately distinct from the
// open Wi‑Fi fan: a bounded card emitting a directional field.
export function ContactlessIcon({ color = '#3A6700', size = 68 }: NfcIconProps) {
  return (
    <Svg height={size} viewBox="0 0 64 64" width={size}>
      <Rect
        fill="none"
        height={48}
        rx={15}
        stroke={color}
        strokeWidth={3.4}
        width={48}
        x={8}
        y={8}
      />
      <Circle cx={22} cy={32} fill={color} r={2.6} />
      <Path
        d="M28 24c5.4 4.6 5.4 11.4 0 16M35 19.5c9 7.2 9 17.8 0 25M42 15c12.6 9.8 12.6 24.2 0 34"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.4}
      />
    </Svg>
  );
}

export function InfoIcon({ color = '#414938', size = 16 }: NfcIconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Circle cx={12} cy={12} fill="none" r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M12 10v6M12 7.5h.01"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={2.4}
      />
    </Svg>
  );
}

export function VerifiedBadgeIcon({ color = '#5C9E08', size = 46 }: NfcIconProps) {
  return (
    <Svg height={size} viewBox="0 0 48 48" width={size}>
      <Circle cx={24} cy={24} fill={color} r={22} />
      <Path
        d="M14 24.5l6.2 6.2L34 17"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      />
    </Svg>
  );
}
