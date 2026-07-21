import type { ImageSourcePropType } from 'react-native';

import { colors } from '@/theme';

const AUTH_HERO_LIGHT_IMAGE =
  require('../../assets/images/campus-landscape-terrace.jpg') as ImageSourcePropType;
export const AUTH_HERO_DARK_IMAGE: ImageSourcePropType = AUTH_HERO_LIGHT_IMAGE;

export function getAuthHeroImage(isDark: boolean): ImageSourcePropType {
  return isDark ? AUTH_HERO_DARK_IMAGE : AUTH_HERO_LIGHT_IMAGE;
}

/** Brand accent used across the auth flow (legacy name kept for call sites). */
export const LIMEADE = colors.primary;
export const AUTH_OVERLAY_VERTICAL_PADDING = 28;

export function getAuthSheetWidth(screenWidth: number) {
  return screenWidth < 600 ? screenWidth : Math.min(screenWidth - 80, 448);
}

export function getAuthSheetHeight(screenHeight: number, ratio: number) {
  return Math.max(Math.round(screenHeight * ratio), 0);
}

export function isTabletWidth(screenWidth: number) {
  return screenWidth >= 600;
}
