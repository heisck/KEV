import Svg, { Circle, Path } from 'react-native-svg';

type NfcIconProps = {
  color?: string;
  size?: number;
};

export function ContactlessIcon({ color = '#3A6700', size = 68 }: NfcIconProps) {
  return (
    <Svg height={size} viewBox="0 0 64 64" width={size}>
      <Path
        d="M18 24c4 4.8 4 11.2 0 16M28 18c7 8.2 7 19.8 0 28M38 12c10 12 10 28 0 40"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
      />
      <Path
        d="M10 18h8M10 46h8M8 22v20"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
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
