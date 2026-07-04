import Animated from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { FloatLoop } from '@/components/doodles/FloatLoop';
import { useStrokeDraw } from '@/hooks/useStrokeDraw';
import { colors } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type DoodleProps = { size?: number };

/** Check-mark burst — verified/success states. */
export function DoodleCelebrate({ size = 120 }: DoodleProps) {
  const ring = useStrokeDraw(200, 100, 800);
  const check = useStrokeDraw(70, 600, 500);

  return (
    <FloatLoop amplitude={3}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <AnimatedPath
          d="M60 24a36 36 0 1 1-.01 0Z"
          stroke={colors.primary}
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeDasharray={200}
          animatedProps={ring}
        />
        <AnimatedPath
          d="M44 61l12 12 22-26"
          stroke={colors.ink}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={70}
          animatedProps={check}
        />
        <Path
          d="M16 26l5 5M100 18l-4 6M108 66h-8M18 88l7-3"
          stroke={colors.primaryDeep}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Circle cx={94} cy={94} r={3} stroke={colors.primary} strokeWidth={2} />
        <Circle cx={24} cy={58} r={2.5} stroke={colors.primary} strokeWidth={2} />
      </Svg>
    </FloatLoop>
  );
}
