import { AUTH_HERO_IMAGE_URL } from '@/screens/authConfig';

const PEXELS_IMAGE_PARAMS = '?auto=compress&cs=tinysrgb&fit=crop&h=900&w=900';
const FLICKR_IMAGE_PARAMS = 'https://loremflickr.com/900/900/black,students?lock=';

export const ROOM_SETUP_SKY_IMAGE_URL = AUTH_HERO_IMAGE_URL;
export const ROOM_SETUP_STUDENT_IMAGE_URLS = [
  `https://images.pexels.com/photos/6281733/pexels-photo-6281733.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/7683693/pexels-photo-7683693.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/6140710/pexels-photo-6140710.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/5940840/pexels-photo-5940840.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/6146978/pexels-photo-6146978.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/4172961/pexels-photo-4172961.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/6238012/pexels-photo-6238012.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/5905497/pexels-photo-5905497.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/30649803/pexels-photo-30649803.jpeg${PEXELS_IMAGE_PARAMS}`,
  `https://images.pexels.com/photos/35129514/pexels-photo-35129514.jpeg${PEXELS_IMAGE_PARAMS}`,
  `${FLICKR_IMAGE_PARAMS}101`,
  `${FLICKR_IMAGE_PARAMS}102`,
  `${FLICKR_IMAGE_PARAMS}103`,
  `${FLICKR_IMAGE_PARAMS}104`,
  `${FLICKR_IMAGE_PARAMS}105`,
  `${FLICKR_IMAGE_PARAMS}106`,
  `${FLICKR_IMAGE_PARAMS}107`,
  `${FLICKR_IMAGE_PARAMS}108`,
  `${FLICKR_IMAGE_PARAMS}109`,
  `${FLICKR_IMAGE_PARAMS}110`,
  `${FLICKR_IMAGE_PARAMS}111`,
  `${FLICKR_IMAGE_PARAMS}112`,
  `${FLICKR_IMAGE_PARAMS}113`,
  `${FLICKR_IMAGE_PARAMS}114`,
  `${FLICKR_IMAGE_PARAMS}115`,
  `${FLICKR_IMAGE_PARAMS}116`,
];

export const ROOM_SETUP_FLOORS = ['B4', 'B3', 'B2', 'B1', 'GF', '1F', '2F', '3F', '4F', '5F'];
export const DEFAULT_ROOM_SETUP_FLOOR_INDEX = 4;
export const ROOM_CREATION_IMAGE_HEIGHT_RATIO = 0.55;
export const ROOM_CREATION_OUTER_STEP_RATIO = 0.06;
export const ROOM_CREATION_INNER_STEP_RATIO = 0.046;

export type RoomCreationLayout = {
  actionTextFontSize: number;
  controlSize: number;
  controlsBottom: number;
  controlsGap: number;
  controlsWidth: number;
  copyBottomPadding: number;
  copyFontSize: number;
  copyGap: number;
  copyLaneWidth: number;
  copyLineHeight: number;
  copyStackWidth: number;
  copyTopPadding: number;
  imageHeight: number;
  innerStepHeight: number;
  maxSwipeX: number;
  nextControlWidth: number;
  outerStepHeight: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getRoomCreationLayout(
  screenWidth: number,
  screenHeight: number,
  bottomInset = 0,
): RoomCreationLayout {
  const shortSide = Math.min(screenWidth, screenHeight);
  const aspectPressure = clamp(screenWidth / screenHeight - 1, 0, 0.55) / 0.55;
  const imageHeight = screenHeight * (ROOM_CREATION_IMAGE_HEIGHT_RATIO - aspectPressure * 0.06);
  const outerStepHeight = screenHeight * ROOM_CREATION_OUTER_STEP_RATIO;
  const innerStepHeight = screenHeight * ROOM_CREATION_INNER_STEP_RATIO;
  const controlSize = clamp(shortSide * 0.19, 56, 76);
  const controlsGap = clamp(shortSide * 0.026, 8, 12);
  const controlsBottom = Math.max(bottomInset, clamp(shortSide * 0.04, 14, 18));
  const sideInset = clamp(screenWidth * 0.035, 10, 18);
  const controlsWidth = Math.min(
    screenWidth - sideInset * 2,
    clamp(shortSide * 1.06, 360, 430),
    Math.max(screenWidth * 0.86, controlSize * 3 + controlsGap * 2 + 160),
  );
  const nextControlWidth = clamp(controlSize * 0.63, 38, 48);
  const maxSwipeX = Math.max(controlSize * 1.1, controlsWidth - controlSize * 2 - controlsGap);
  const textTrackWidth = Math.max(48, controlsWidth - controlSize * 2 - nextControlWidth - 18);
  const contentHeight = Math.max(0, screenHeight - imageHeight);
  const copyBottomPadding = controlsBottom + controlSize + clamp(contentHeight * 0.05, 8, 22);
  const copyTopPadding = clamp(outerStepHeight * 0.4, 4, 18);
  const copyAvailableHeight = Math.max(72, contentHeight - copyTopPadding - copyBottomPadding);
  const copyStackWidth = Math.min(screenWidth - sideInset * 2, clamp(screenWidth * 0.86, 330, 620));
  const copyLaneWidth = copyStackWidth * 0.42;
  const copyGap = clamp(copyAvailableHeight * 0.075, 8, 28);
  const copyFontSize = clamp(
    Math.min(copyLaneWidth / 4.55, (copyAvailableHeight - copyGap * 2) / 3.05),
    20,
    46,
  );

  return {
    controlSize,
    controlsBottom,
    controlsGap,
    controlsWidth,
    copyBottomPadding,
    copyFontSize,
    copyGap,
    copyLaneWidth,
    copyLineHeight: copyFontSize * 1.08,
    copyStackWidth,
    copyTopPadding,
    imageHeight,
    innerStepHeight,
    maxSwipeX,
    nextControlWidth,
    outerStepHeight,
    actionTextFontSize: clamp(textTrackWidth / 10.6, 8, 13),
  };
}

export type RoomSetupStep = 0 | 1 | 2;
