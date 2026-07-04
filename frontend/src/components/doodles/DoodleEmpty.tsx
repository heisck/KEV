import Animated from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { FloatLoop } from '@/components/doodles/FloatLoop';
import { useStrokeDraw } from '@/hooks/useStrokeDraw';
import { colors } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type DoodleProps = { size?: number };

/** Open clipboard with a wandering dotted trail — empty lists. */
export function DoodleEmpty({ size = 120 }: DoodleProps) {
  const trail = useStrokeDraw(110, 500, 1200);

  return (
    <FloatLoop amplitude={4}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Rect x={34} y={26} width={52} height={68} rx={10} stroke={colors.ink} strokeWidth={2.4} />
        <Rect
          x={48}
          y={18}
          width={24}
          height={14}
          rx={6}
          stroke={colors.primary}
          strokeWidth={2.2}
        />
        <Path d="M46 50h28M46 62h20" stroke={colors.ink} strokeWidth={2.2} strokeLinecap="round" />
        <AnimatedPath
          d="M46 76c10 8 24-6 34 4 6 6 4 14-4 16"
          stroke={colors.primary}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeDasharray="1 7"
          animatedProps={trail}
        />
        <Circle cx={22} cy={40} r={3} stroke={colors.primaryDeep} strokeWidth={2} />
        <Path
          d="M100 36l6-4M102 82l7 3M16 78l-6 3"
          stroke={colors.primaryDeep}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </FloatLoop>
  );
}
