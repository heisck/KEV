import type { ImageSourcePropType } from 'react-native';

import { colors } from '@/theme';

export const AUTH_HERO_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBGTxz5nYdAUZfqgCDwdwPdskwGJsj5Ssnd-cQvioLU6l-gG0sjh27y2dIIaIe88lIaNlrj0SYzDKlcX4u1a6NUYNlZUlNb-2AfONqH4YC7PVZjp0C0-H8w817kv1w8MyEh1QlAVCO5jg2qN9KYBqWEl2XOhTlMgtFfhQFgLPSbO6FdOO1X10HVYRTgXhlGyKHKzhpYkbhy5qtHf-4ZAEwYaXYN-yaJ3rwVKA3MRJsP3IqCSdzcK4SY63PBKcC8XsksZEIn-AEmZ3g';

const AUTH_HERO_LIGHT_IMAGE: ImageSourcePropType = { uri: AUTH_HERO_IMAGE_URL };
export const AUTH_HERO_DARK_IMAGE: ImageSourcePropType = require('../../assets/images/auth-hero-dark.jpg');

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
