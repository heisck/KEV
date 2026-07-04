/**
 * KEV design tokens — single source of truth for color, spacing, radii and type.
 * Brand: teal #3E97B0, deep slate-teal #416363, mint #EDFFF8.
 */
export const colors = {
  // Brand
  primary: '#3E97B0',
  primaryDeep: '#416363',
  mint: '#EDFFF8',

  // Tints (primary at low alpha for chips/pills/soft fills)
  primary08: 'rgba(62, 151, 176, 0.08)',
  primary12: 'rgba(62, 151, 176, 0.12)',
  primary20: 'rgba(62, 151, 176, 0.20)',
  mintDeep: '#D7F4E9',

  // Neutrals
  ink: '#0E1B1E',
  inkSoft: '#3C5257',
  muted: '#7A9196',
  hairline: '#E3EEEA',
  surface: '#FFFFFF',
  surfaceDim: '#F4FAF7',
  black: '#111417',
  white: '#FFFFFF',

  // Semantic
  success: '#2E9E6B',
  successSoft: '#E3F6EC',
  warn: '#E8A13A',
  warnSoft: '#FBF1DF',
  error: '#D9534F',
  errorSoft: '#FBE9E8',
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
