const CLOUDINARY_BASE = 'https://res.cloudinary.com/catravels/image/upload';

const ASSETS = [
  'v1784638235/kev/session-artwork/campus-glass-building-close.jpg',
  'v1784638238/kev/session-artwork/campus-glass-building-walkway.jpg',
  'v1784638241/kev/session-artwork/campus-college-art-sign.jpg',
  'v1784638243/kev/session-artwork/campus-garden-walkers.jpg',
  'v1784638246/kev/session-artwork/campus-wide-walkway.jpg',
  'v1784638249/kev/session-artwork/campus-transit-green.jpg',
  'v1784638252/kev/session-artwork/campus-academic-block.jpg',
  'v1784638255/kev/session-artwork/campus-landscape-terrace.jpg',
] as const;

const TRANSFORMS = {
  thumbnail: 'f_auto,q_auto:eco,c_fill,g_auto,w_288,h_288',
  feature: 'f_auto,q_auto:eco,c_fill,g_auto,w_960,h_540',
  hero: 'f_auto,q_auto:eco,c_fill,g_auto,w_960,h_1280',
} as const;

export type SessionArtworkVariant = keyof typeof TRANSFORMS;

const url = (asset: string, variant: SessionArtworkVariant) =>
  `${CLOUDINARY_BASE}/${TRANSFORMS[variant]}/${asset}`;

export const SESSION_ARTWORK_URLS = {
  thumbnail: url(ASSETS[0], 'thumbnail'),
  feature: url(ASSETS[4], 'feature'),
  hero: url(ASSETS[7], 'hero'),
} as const;

export function getSessionArtworkUrl(variant: SessionArtworkVariant, seed = ''): string {
  const hash = [...seed].reduce((value, character) => value + character.charCodeAt(0), 0);
  return url(ASSETS[hash % ASSETS.length], variant);
}
