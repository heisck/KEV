import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color: string; size?: number };

/* ---------- Tab bar ---------- */

export function HomeTabIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path d="M9.5 20.5v-5h5v5" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  );
}

export function RemindersTabIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5} width={16} height={15.5} rx={3} stroke={color} strokeWidth={1.7} />
      <Path d="M8 3v4M16 3v4M4 10h16" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

/** Winding route with waypoint dots — the mockup's centre-tab glyph. */
export function ExamsTabIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 19h9a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h9"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeDasharray="1 3.6"
      />
      <Circle cx={5.5} cy={19} r={2.2} stroke={color} strokeWidth={1.7} />
      <Circle cx={18.5} cy={5} r={2.2} stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

export function ChatTabIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12a8 8 0 1 1 3.1 6.3L4 19.5l1-3.2A7.9 7.9 0 0 1 4 12Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 12h.01M12 12h.01M15.5 12h.01"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ProfileTabIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.5} r={3.8} stroke={color} strokeWidth={1.7} />
      <Path
        d="M5 20c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ---------- Chrome ---------- */

export function BellIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 10a6 6 0 1 1 12 0c0 3 .8 4.6 1.6 5.6.5.6.1 1.4-.7 1.4H5.1c-.8 0-1.2-.8-.7-1.4C5.2 14.6 6 13 6 10Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path d="M10 20a2.2 2.2 0 0 0 4 0" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function BackIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.5 5.5 8 12l6.5 6.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Viewfinder / scan glyph in the mockup's top-right circle buttons. */
export function ScanFrameIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8V6a2 2 0 0 1 2-2h2m8 0h2a2 2 0 0 1 2 2v2m0 8v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={12} r={2.6} stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function CloseIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m6 6 12 12M18 6 6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function SearchIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={1.8} />
      <Path d="m16 16 4.5 4.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function BookmarkIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 4.5h11a.5.5 0 0 1 .5.5v15l-6-4.2L6 20V5a.5.5 0 0 1 .5-.5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ---------- Exam cards ---------- */

export function ClockIcon({ color, size = 13 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} fill={color} />
      <Path d="M12 7.5V12l3 2" stroke="#FFF" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckCircleIcon({ color, size = 17 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={color} opacity={0.16} />
      <Path
        d="m7.5 12.2 3 3 6-6.4"
        stroke={color}
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Filled round "!" — pending checklist items (the mockup's red glyph slot). */
export function AlertIcon({ color, size = 17 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={10} fill={color} />
      <Path d="M12 6.8v6.4" stroke="#FFF" strokeWidth={2.4} strokeLinecap="round" />
      <Circle cx={12} cy={17} r={1.4} fill="#FFF" />
    </Svg>
  );
}

export function StudentsIcon({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8.5} r={3.2} fill={color} />
      <Path d="M3.5 19c.7-3.2 2.9-4.8 5.5-4.8s4.8 1.6 5.5 4.8" fill={color} />
      <Circle cx={16.5} cy={9} r={2.5} fill={color} opacity={0.55} />
      <Path d="M14.8 14.6c2.6-.7 5 .8 5.7 4.4h-4" fill={color} opacity={0.55} />
    </Svg>
  );
}

export function ChevronRightIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m9 5.5 6.5 6.5L9 18.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ---------- Session details ---------- */

/** Footsteps glyph used on "Open room map" / "Live tracking" chips. */
export function StepsIcon({ color, size = 13 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 4c1.7 0 2.7 1.6 2.7 3.6 0 1.5-.6 2.4-1.5 2.6l.2 2.3-2.8.3-.3-2.4C5.4 10 5 8.9 5 7.6 5 5.6 6.3 4 8 4Z"
        fill={color}
      />
      <Path
        d="M16 11c1.7 0 3 1.6 3 3.6 0 1.3-.4 2.4-1.3 2.8l-.3 2.4-2.8-.3.2-2.3c-.9-.2-1.5-1.1-1.5-2.6 0-2 1-3.6 2.7-3.6Z"
        fill={color}
      />
    </Svg>
  );
}

export function NfcIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 9.5a12 12 0 0 1 16 0M6.8 12.8a8 8 0 0 1 10.4 0M9.6 16a4 4 0 0 1 4.8 0"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={18.8} r={1.4} fill={color} />
    </Svg>
  );
}

export function FaceIdIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 8V6a2 2 0 0 1 2-2h2m8 0h2a2 2 0 0 1 2 2v2m0 8v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M8.7 9.5v1.2M15.3 9.5v1.2M12 9.8v3.3h-.9"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Path d="M9 15.7a4.4 4.4 0 0 0 6 0" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

/** Filled rounded tile with QR marks (mirrors the mockup's filled "P" tile). */
export function QrIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={4} width={16} height={16} rx={4} fill={color} />
      <Rect x={7} y={7} width={4} height={4} rx={1} fill="#FFF" />
      <Rect x={13} y={7} width={4} height={4} rx={1} fill="#FFF" />
      <Rect x={7} y={13} width={4} height={4} rx={1} fill="#FFF" />
      <Path
        d="M13.5 14.5H15V13M15.5 16.5H17V15"
        stroke="#FFF"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Keypad dots — manual code entry. */
export function KeypadIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {[6, 12, 18].map((x) =>
        [6, 12].map((y) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.9} fill={color} />),
      )}
      <Circle cx={12} cy={18} r={1.9} fill={color} />
    </Svg>
  );
}

/* ---------- Group session ---------- */

export function PlusIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

export function SendIcon({ color, size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 3 3.8 10.2c-.7.3-.6 1.3.1 1.5l6.4 1.9 2 6.4c.2.7 1.2.8 1.5.1L21 3Z"
        fill={color}
      />
    </Svg>
  );
}

/* ---------- Profile & auth ---------- */

export function EllipsisIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={5} cy={12} r={1.8} fill={color} />
      <Circle cx={12} cy={12} r={1.8} fill={color} />
      <Circle cx={19} cy={12} r={1.8} fill={color} />
    </Svg>
  );
}

export function PinIcon({ color, size = 13 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.5a7 7 0 0 1 7 7c0 5-7 12-7 12s-7-7-7-12a7 7 0 0 1 7-7Z" fill={color} />
      <Circle cx={12} cy={9.5} r={2.6} fill="#FFF" />
    </Svg>
  );
}

export function DocIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3.5h8L19 8.5V20a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20V5a1.5 1.5 0 0 1 1-1.5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <Path
        d="M14 3.5v5h5M9 13h6M9 16.5h6"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CrownIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="m4 8 4 3.5L12 5l4 6.5L20 8l-1.6 10H5.6L4 8Z" fill={color} />
    </Svg>
  );
}

export function LockIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5} y={10} width={14} height={10.5} rx={3} fill={color} />
      <Path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={15.2} r={1.6} fill="#FFF" />
    </Svg>
  );
}

export function PencilIcon({ color, size = 15 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m14.5 5 4.5 4.5L8.5 20H4v-4.5L14.5 5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function VerifiedBadgeIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={11} fill={color} stroke="#FFF" strokeWidth={2} />
      <Path
        d="m7.8 12.2 2.8 2.8 5.6-6"
        stroke="#FFF"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
