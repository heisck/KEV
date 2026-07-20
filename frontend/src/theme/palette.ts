import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/theme/tokens';

/**
 * Theme-aware token set. Screens read these via {@link usePalette} so the
 * whole app responds to the light/dark/system preference. Accent + semantic
 * hues stay close across themes; surfaces and text invert.
 */
export type Palette = {
  isDark: boolean;
  // Surfaces
  bg: string;
  surface: string;
  surfaceDim: string;
  card: string;
  input: string;
  hairline: string;
  // Text / foreground
  ink: string;
  inkSoft: string;
  muted: string;
  /** Foreground on a primary-filled control — stays light in both themes. */
  onPrimary: string;
  // Brand
  primary: string;
  primaryDeep: string;
  primary08: string;
  primary12: string;
  primary20: string;
  mint: string;
  mintDeep: string;
  // Semantic
  success: string;
  successSoft: string;
  warn: string;
  warnSoft: string;
  error: string;
  errorSoft: string;
  /** Alias for {@link error} kept for existing callers. */
  danger: string;
  // Accents
  pink: string;
  pinkSoft: string;
  blue: string;
  blueSoft: string;
  star: string;
};

const light: Palette = {
  isDark: false,
  bg: colors.white,
  surface: colors.surface,
  surfaceDim: colors.surfaceDim,
  card: colors.surfaceDim,
  input: colors.surfaceDim,
  hairline: colors.hairline,
  ink: colors.ink,
  inkSoft: colors.inkSoft,
  muted: colors.muted,
  onPrimary: colors.white,
  primary: colors.primary,
  primaryDeep: colors.primaryDeep,
  primary08: colors.primary08,
  primary12: colors.primary12,
  primary20: colors.primary20,
  mint: colors.mint,
  mintDeep: colors.mintDeep,
  success: colors.success,
  successSoft: colors.successSoft,
  warn: colors.warn,
  warnSoft: colors.warnSoft,
  error: colors.error,
  errorSoft: colors.errorSoft,
  danger: colors.error,
  pink: colors.pink,
  pinkSoft: colors.pinkSoft,
  blue: colors.blue,
  blueSoft: colors.blueSoft,
  star: colors.star,
};

const dark: Palette = {
  isDark: true,
  bg: '#0E0E12',
  surface: '#17171C',
  surfaceDim: '#1E1E26',
  card: '#1E1E26',
  input: '#252530',
  hairline: '#2A2A34',
  ink: '#F4F4F7',
  inkSoft: '#B8B7C2',
  muted: '#8A8996',
  onPrimary: '#FFFFFF',
  primary: '#7B76E8',
  primaryDeep: '#9A95F0',
  primary08: 'rgba(123, 118, 232, 0.10)',
  primary12: 'rgba(123, 118, 232, 0.18)',
  primary20: 'rgba(123, 118, 232, 0.28)',
  mint: '#20202A',
  mintDeep: '#2A2A38',
  success: '#5FC27E',
  successSoft: 'rgba(95, 194, 126, 0.16)',
  warn: '#F2B33D',
  warnSoft: 'rgba(242, 179, 61, 0.16)',
  error: '#F07171',
  errorSoft: 'rgba(240, 113, 113, 0.16)',
  danger: '#F07171',
  pink: '#E27AAE',
  pinkSoft: 'rgba(226, 122, 174, 0.16)',
  blue: '#5E8BEE',
  blueSoft: 'rgba(94, 139, 238, 0.16)',
  star: '#F2B33D',
};

export function getPalette(isDark: boolean): Palette {
  return isDark ? dark : light;
}

/** Resolves the active palette from the theme preference (system → OS scheme). */
export function usePalette(): Palette {
  const theme = useSettingsStore((s) => s.theme);
  const scheme = useColorScheme();
  const isDark = theme === 'system' ? scheme === 'dark' : theme === 'dark';
  return getPalette(isDark);
}
