import Animated from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { FloatLoop } from '@/components/doodles/FloatLoop';
import { useStrokeDraw } from '@/hooks/useStrokeDraw';
import { colors } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type DoodleProps = { size?: number };

/** Line-art thinking head with sparks — used on auth/upgrade heroes. */
export function DoodleBrain({ size = 120 }: DoodleProps) {
  const outline = useStrokeDraw(220, 100, 1100);
  const swirl = useStrokeDraw(90, 700);

  return (
    <FloatLoop amplitude={4}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <AnimatedPath
          d="M44 100V88c-9-5-16-14-16-26 0-17 14-30 31-30s30 13 30 30c0 8-3 14-8 20l4 18"
          stroke={colors.ink}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={220}
          animatedProps={outline}
        />
        <AnimatedPath
          d="M48 58c0-8 6-13 12-13s11 5 11 12-5 11-11 11c-4 0-7-2-9-5"
          stroke={colors.primary}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeDasharray={90}
          animatedProps={swirl}
        />
        <Circle cx={92} cy={26} r={3} stroke={colors.primary} strokeWidth={2} />
        <Path
          d="M18 30l6 4M14 46h7M100 44l8-2M84 14l3-7"
          stroke={colors.primaryDeep}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </FloatLoop>
  );
}
