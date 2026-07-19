/**
 * KEV design tokens — single source of truth for color, spacing, radii and type.
 * Brand: indigo #5A55D9 on white, soft lavender fills (kev design system).
 */
export const colors = {
  // Brand
  primary: '#5A55D9',
  primaryDeep: '#443FBF',
  mint: '#F3F1FB',

  // Tints (primary at low alpha for chips/pills/soft fills)
  primary08: 'rgba(90, 85, 217, 0.08)',
  primary12: 'rgba(90, 85, 217, 0.12)',
  primary20: 'rgba(90, 85, 217, 0.20)',
  mintDeep: '#E5E1F7',

  // Neutrals
  ink: '#17171C',
  inkSoft: '#4A4A55',
  muted: '#9A99A6',
  hairline: '#EFEEF4',
  surface: '#FFFFFF',
  surfaceDim: '#F7F7FA',
  black: '#111114',
  white: '#FFFFFF',

  // Semantic
  success: '#43A45F',
  successSoft: '#E4F4E8',
  warn: '#F2B33D',
  warnSoft: '#FBF1DF',
  error: '#DE5B5B',
  errorSoft: '#FBE9E8',

  // Accents (kev mockup)
  pink: '#D6619C',
  pinkSoft: '#F9E7F1',
  blue: '#3D6DE0',
  blueSoft: '#EAF1FD',
  star: '#F2B33D',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  /** Oversized serif headline (Roam-style hero). Loaded in the root layout. */
  display: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  /** Body text uses the platform default; weights via fontWeight. */
  body: undefined,
} as const;

export const shadows = {
  card: {
    shadowColor: '#0E1B1E',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  floating: {
    shadowColor: '#0E1B1E',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;
