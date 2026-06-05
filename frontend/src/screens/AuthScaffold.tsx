import { type ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppLogoMark, getAppLogoMarkSize, getCenteredHeroLogoTop } from '@/components/AppLogoMark';
import { SystemStatusBar } from '@/components/SystemStatusBar';
import {
  AUTH_HERO_IMAGE_URL,
  getAuthSheetHeight,
  getAuthSheetWidth,
  isTabletWidth,
} from '@/screens/authConfig';

const HERO_CAPTION_HEIGHT = 42;
const HERO_CAPTION_GAP = 18;

type AuthScaffoldProps = {
  children: ReactNode;
  heightRatio: number;
  heroCaption?: ReactNode;
  withPanel?: boolean;
};

export function AuthScaffold({
  children,
  heightRatio,
  heroCaption,
  withPanel = true,
}: AuthScaffoldProps) {
  const { height, width } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const isTablet = isTabletWidth(width);
  const minHeightRatio = isTablet ? Math.min(heightRatio, 0.34) : heightRatio;
  const sheetHeight = getAuthSheetHeight(height, minHeightRatio);
  const logoSize = getAppLogoMarkSize();
  const centeredLogoTop = Math.round(
    (height - logoSize.height - HERO_CAPTION_GAP - (heroCaption ? HERO_CAPTION_HEIGHT : 0)) / 2,
  );
  const logoTop = withPanel
    ? getCenteredHeroLogoTop(height, sheetHeight, top)
    : Math.max(top + 112, centeredLogoTop);
  const captionTop = logoTop + logoSize.height + HERO_CAPTION_GAP;

  return (
    <View style={styles.screen}>
      <SystemStatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{ uri: AUTH_HERO_IMAGE_URL }}
        style={styles.hero}
      />
      <View pointerEvents="none" style={[styles.logoAnchor, { top: logoTop }]}>
        <AppLogoMark />
      </View>
      {heroCaption ? (
        <View pointerEvents="none" style={[styles.heroCaption, { top: captionTop }]}>
          {heroCaption}
        </View>
      ) : null}
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          withPanel ? styles.content : styles.overlayContent,
          !withPanel && { paddingBottom: bottom + 28, paddingTop: top + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {withPanel ? (
          <View
            style={[
              styles.panel,
              isTablet && styles.tabletPanel,
              {
                minHeight: sheetHeight,
                paddingBottom: 22 + bottom,
                width: getAuthSheetWidth(width),
              },
            ]}
          >
            {children}
          </View>
        ) : (
          children
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#111111', flex: 1 },
  hero: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  logoAnchor: { alignItems: 'center', left: 0, position: 'absolute', right: 0, zIndex: 1 },
  heroCaption: {
    alignItems: 'center',
    left: 32,
    position: 'absolute',
    right: 32,
    zIndex: 1,
  },
  scroll: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'flex-end' },
  overlayContent: { flexGrow: 1, paddingHorizontal: 24 },
  panel: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    elevation: 10,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 26,
    shadowColor: '#111111',
    shadowOffset: { height: -6, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  tabletPanel: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
});
