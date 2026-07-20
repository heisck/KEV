import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { VerifiedBadgeIcon } from '@/components/kev/icons';
import { usePalette } from '@/theme';

export type PersonKey = 'me' | 'ben' | 'freja' | 'kofi' | 'milan' | 'anna';

type Look = { bg: [string, string]; skin: string; hair: string };

const LOOKS: Record<PersonKey, Look> = {
  me: { bg: ['#FFD9A0', '#F09A54'], skin: '#E8AF83', hair: '#3E2A20' },
  ben: { bg: ['#BFD8F7', '#6D96D8'], skin: '#EDB68C', hair: '#4A3526' },
  freja: { bg: ['#F7CFE0', '#D682AC'], skin: '#F2C39C', hair: '#E8C86A' },
  kofi: { bg: ['#CDEBD4', '#6FBE83'], skin: '#8A5A3B', hair: '#241A12' },
  milan: { bg: ['#E3D6F5', '#9A7ED0'], skin: '#EDB68C', hair: '#B9B4AC' },
  anna: { bg: ['#F6D8C8', '#DE8F6C'], skin: '#F0BE96', hair: '#6E3A24' },
};

const isUrl = (v: string) => /^https?:\/\//i.test(v);

export function initialsFor(displayName: string | null, email: string | null): string {
  return (displayName ?? email ?? '?')
    .split(/[\s.@]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Illustrated portrait stand-in, or a real photo when `person` is a URL
 * (student records carry photo URLs). Unknown keys fall back to a default look.
 */
export function Avatar({
  person,
  size,
  verified = false,
}: {
  person: PersonKey | string;
  size: number;
  verified?: boolean;
}) {
  const p = usePalette();

  if (typeof person === 'string' && isUrl(person)) {
    return (
      <View style={{ width: size, height: size }}>
        <Image
          source={{ uri: person }}
          style={[styles.clip, { borderRadius: size / 2, height: size, width: size }]}
        />
        {verified ? (
          <View style={styles.badge}>
            <VerifiedBadgeIcon color={p.ink} size={Math.round(size * 0.32)} />
          </View>
        ) : null}
      </View>
    );
  }

  const { bg, skin, hair } = LOOKS[person as PersonKey] ?? LOOKS.me;
  const key = (person as string) in LOOKS ? (person as PersonKey) : 'me';
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.clip, { borderRadius: size / 2 }]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={`av-${key}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={bg[0]} />
              <Stop offset="1" stopColor={bg[1]} />
            </LinearGradient>
          </Defs>
          <Rect width={100} height={100} fill={`url(#av-${key})`} />
          <Path d="M18 100c4-24 16-36 32-36s28 12 32 36H18Z" fill={skin} />
          <Circle cx={50} cy={42} r={20} fill={skin} />
          <Path
            d="M28 42c0-14 10-24 22-24s22 10 22 24c-4-10-12-14-22-14s-18 4-22 14Z"
            fill={hair}
          />
        </Svg>
      </View>
      {verified ? (
        <View style={styles.badge}>
          <VerifiedBadgeIcon color={p.ink} size={Math.round(size * 0.32)} />
        </View>
      ) : null}
    </View>
  );
}

export type FlagKey = 'be' | 'dk' | 'cz' | 'gb' | 'it';

/** National flags in a rounded circle chip, per the mockup. */
export function Flag({ flag, size = 20 }: { flag: FlagKey; size?: number }) {
  const p = usePalette();
  return (
    <View
      style={[
        styles.clip,
        styles.flag,
        { borderColor: p.surface, borderRadius: size / 2, height: size, width: size },
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 30 30" preserveAspectRatio="xMidYMid slice">
        {flag === 'be' && (
          <>
            <Rect width={10} height={30} fill="#2D2926" />
            <Rect x={10} width={10} height={30} fill="#FFCD00" />
            <Rect x={20} width={10} height={30} fill="#C8102E" />
          </>
        )}
        {flag === 'dk' && (
          <>
            <Rect width={30} height={30} fill="#C8102E" />
            <Rect x={9} width={5} height={30} fill="#FFF" />
            <Rect y={12.5} width={30} height={5} fill="#FFF" />
          </>
        )}
        {flag === 'cz' && (
          <>
            <Rect width={30} height={15} fill="#FFF" />
            <Rect y={15} width={30} height={15} fill="#D7141A" />
            <Path d="M0 0v30l16-15L0 0Z" fill="#11457E" />
          </>
        )}
        {flag === 'gb' && (
          <>
            <Rect width={30} height={30} fill="#012169" />
            <Path d="M0 0 30 30M30 0 0 30" stroke="#FFF" strokeWidth={6} />
            <Path d="M0 0 30 30M30 0 0 30" stroke="#C8102E" strokeWidth={3} />
            <Path d="M15 0v30M0 15h30" stroke="#FFF" strokeWidth={9} />
            <Path d="M15 0v30M0 15h30" stroke="#C8102E" strokeWidth={5} />
          </>
        )}
        {flag === 'it' && (
          <>
            <Rect width={10} height={30} fill="#009246" />
            <Rect x={10} width={10} height={30} fill="#FFF" />
            <Rect x={20} width={10} height={30} fill="#CE2B37" />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { flex: 1, overflow: 'hidden' },
  flag: { borderWidth: 1.5, flex: 0 },
  badge: { bottom: -1, position: 'absolute', right: -1 },
});
