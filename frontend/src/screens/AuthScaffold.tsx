import { type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppLogoMark,
  HERO_LOGO_CAPTION_GAP,
  HERO_LOGO_COLOR,
  getAppLogoMarkSize,
  getCenteredHeroLogoTop,
  getFloatingHeroLogoTop,
} from '@/components/AppLogoMark';
import { SystemStatusBar } from '@/components/SystemStatusBar';
import {
  AUTH_OVERLAY_VERTICAL_PADDING,
  getAuthHeroImage,
  getAuthSheetHeight,
  getAuthSheetWidth,
  isTabletWidth,
} from '@/screens/authConfig';
import { usePalette } from '@/theme';

type AuthScaffoldProps = {
  children: ReactNode;
  heightRatio: number;
  heroCaption?: ReactNode;
  /** Anchored to the screen (outside the ScrollView) so the keyboard never shifts it. */
  overlayTitle?: ReactNode;
  withPanel?: boolean;
};

export function AuthScaffold({
  children,
  heightRatio,
  heroCaption,
  overlayTitle,
  withPanel = true,
}: AuthScaffoldProps) {
  const { height, width } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();
  const palette = usePalette();
  const isTablet = isTabletWidth(width);
  const minHeightRatio = isTablet ? Math.min(heightRatio, 0.34) : heightRatio;
  const sheetHeight = getAuthSheetHeight(height, minHeightRatio);
  const logoSize = getAppLogoMarkSize();
  const logoTop = withPanel
    ? getCenteredHeroLogoTop(height, sheetHeight, top)
    : getFloatingHeroLogoTop(height, top, Boolean(heroCaption));
  const captionTop = logoTop + logoSize.height + HERO_LOGO_CAPTION_GAP;

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SystemStatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={getAuthHeroImage(palette.isDark)}
        style={styles.hero}
      />
      <View pointerEvents="none" style={[styles.logoAnchor, { top: logoTop }]}>
        <AppLogoMark color={HERO_LOGO_COLOR} />
      </View>
      {heroCaption ? (
        <View pointerEvents="none" style={[styles.heroCaption, { top: captionTop }]}>
          {heroCaption}
        </View>
      ) : null}
      {overlayTitle ? (
        <View
          pointerEvents="none"
          style={[styles.overlayTitle, { top: top + AUTH_OVERLAY_VERTICAL_PADDING }]}
        >
          {overlayTitle}
        </View>
      ) : null}
      <KeyboardAvoidingView
        // Position avoids the delayed ScrollView reflow that makes iOS fields move twice.
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        contentContainerStyle={styles.keyboardContent}
        style={styles.scroll}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={[
            withPanel ? styles.content : styles.overlayContent,
            !withPanel && {
              paddingBottom: bottom + AUTH_OVERLAY_VERTICAL_PADDING,
              paddingTop: top + AUTH_OVERLAY_VERTICAL_PADDING,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  hero: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  logoAnchor: { alignItems: 'center', left: 0, position: 'absolute', right: 0, zIndex: 1 },
  heroCaption: {
    alignItems: 'center',
    left: 32,
    position: 'absolute',
    right: 32,
    zIndex: 1,
  },
  overlayTitle: { alignItems: 'center', left: 0, position: 'absolute', right: 0, zIndex: 1 },
  keyboardContent: { flex: 1 },
  // Above the hero logo overlay (zIndex 1) so inputs are never obscured.
  scroll: { flex: 1, zIndex: 2 },
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
