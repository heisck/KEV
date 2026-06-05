export const AUTH_HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?auto=format&fit=crop&w=1200&q=80';

export const LIMEADE = '#5C9E08';

export function getAuthSheetWidth(screenWidth: number) {
  return screenWidth < 600 ? screenWidth : Math.min(screenWidth - 80, 448);
}

export function getAuthSheetHeight(screenHeight: number, ratio: number) {
  return Math.max(Math.round(screenHeight * ratio), 0);
}

export function isTabletWidth(screenWidth: number) {
  return screenWidth >= 600;
}
