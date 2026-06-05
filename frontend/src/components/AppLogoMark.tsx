import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  CELL,
  COMMA_HEIGHT,
  COMMA_LEFT,
  COMMA_PATH,
  COMMA_TOP,
  COMMA_WIDTH,
  finalHiddenLines,
  INK,
  LINE,
  lineSpecs,
  LOGO_HEIGHT,
  LOGO_WIDTH,
  type LineSpec,
} from '@/components/splashLogo';

export const HERO_LOGO_SCALE = 0.55;

export function getAppLogoMarkSize(scale = HERO_LOGO_SCALE) {
  return { height: LOGO_HEIGHT * scale, width: LOGO_WIDTH * scale };
}

export function getCenteredHeroLogoTop(
  screenHeight: number,
  bottomContentHeight: number,
  topInset: number,
  scale = HERO_LOGO_SCALE,
) {
  const { height } = getAppLogoMarkSize(scale);
  const topSpace = Math.max(screenHeight - bottomContentHeight, height);
  return Math.max(topInset + 24, Math.round((topSpace - height) / 2));
}

export function AppLogoMark({
  accessibilityLabel = 'KEV logo',
  color = INK,
  scale = HERO_LOGO_SCALE,
}: {
  accessibilityLabel?: string;
  color?: string;
  scale?: number;
}) {
  const size = getAppLogoMarkSize(scale);

  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="image" style={size}>
      {lineSpecs.map((line) =>
        finalHiddenLines.has(line.key) ? null : (
          <View key={line.key} style={getLineStyle(line, scale, color)} />
        ),
      )}
      <View
        style={{
          height: COMMA_HEIGHT * scale,
          left: COMMA_LEFT * scale,
          position: 'absolute',
          top: COMMA_TOP * scale,
          width: COMMA_WIDTH * scale,
        }}
      >
        <Svg height="100%" viewBox="0 0 115 178" width="100%">
          <Path d={COMMA_PATH} fill={color} />
        </Svg>
      </View>
    </View>
  );
}

function getLineStyle(line: LineSpec, scale: number, color: string) {
  const hairline = Math.max(1, Math.round(scale));
  const base = {
    backgroundColor: color === INK ? LINE : color,
    left: line.col * CELL * scale,
    position: 'absolute' as const,
    top: line.row * CELL * scale,
  };

  if (line.direction === 'h') {
    return { ...base, height: hairline, width: CELL * scale };
  }

  return { ...base, height: CELL * scale, width: hairline };
}
