import { colors } from '@/theme/tokens';
import { useSettingsStore } from '@/store/settingsStore';

/** Light / dark surface tokens for screens that respect the theme toggle. */
export type Palette = {
  bg: string;
  surface: string;
  surfaceDim: string;
  ink: string;
  inkSoft: string;
  muted: string;
  hairline: string;
  primary: string;
  primarySoft: string;
  card: string;
  input: string;
  danger: string;
};

const light: Palette = {
  bg: colors.white,
  surface: colors.surface,
  surfaceDim: colors.surfaceDim,
  ink: colors.ink,
  inkSoft: colors.inkSoft,
  muted: colors.muted,
  hairline: colors.hairline,
  primary: colors.primary,
  primarySoft: colors.primary12,
  card: colors.surfaceDim,
  input: colors.surfaceDim,
  danger: colors.error,
};

const dark: Palette = {
  bg: '#0E0E12',
  surface: '#17171C',
  surfaceDim: '#1E1E26',
  ink: '#F4F4F7',
  inkSoft: '#B8B7C2',
  muted: '#8A8996',
  hairline: '#2A2A34',
  primary: '#7B76E8',
  primarySoft: 'rgba(123, 118, 232, 0.18)',
  card: '#1E1E26',
  input: '#252530',
  danger: '#F07171',
};

export function getPalette(darkMode: boolean): Palette {
  return darkMode ? dark : light;
}

export function usePalette(): Palette {
  const darkMode = useSettingsStore((s) => s.darkMode);
  return getPalette(darkMode);
}
