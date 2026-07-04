import Animated from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { FloatLoop } from '@/components/doodles/FloatLoop';
import { useStrokeDraw } from '@/hooks/useStrokeDraw';
import { colors } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type DoodleProps = { size?: number };

/** Line-art student ID card with radiating scan waves. */
export function DoodleScan({ size = 120 }: DoodleProps) {
  const wave1 = useStrokeDraw(40, 400);
  const wave2 = useStrokeDraw(60, 650);
  const wave3 = useStrokeDraw(80, 900);

  return (
    <FloatLoop>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Rect
          x={14}
          y={34}
          width={64}
          height={44}
          rx={8}
          stroke={colors.ink}
          strokeWidth={2.4}
          transform="rotate(-6 46 56)"
        />
        <Circle cx={34} cy={50} r={7} stroke={colors.primary} strokeWidth={2.2} />
        <Path
          d="M25 68c2-6 6-9 9-9s7 3 9 9"
          stroke={colors.primary}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <Path
          d="M52 48h18M52 56h14M52 64h10"
          stroke={colors.ink}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <AnimatedPath
          d="M86 48a14 14 0 0 1 0 20"
          stroke={colors.primary}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray={40}
          animatedProps={wave1}
        />
        <AnimatedPath
          d="M94 41a24 24 0 0 1 0 34"
          stroke={colors.primary}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray={60}
          animatedProps={wave2}
        />
        <AnimatedPath
          d="M102 34a34 34 0 0 1 0 48"
          stroke={colors.primaryDeep}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray={80}
          animatedProps={wave3}
        />
        <Path
          d="M20 24l4-8M32 22l1-9M10 40l-8-3"
          stroke={colors.primaryDeep}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </FloatLoop>
  );
}
