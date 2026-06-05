import { type ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  AUTH_HERO_IMAGE_URL,
  getAuthSheetHeight,
  getAuthSheetWidth,
  isTabletWidth,
} from '@/screens/authConfig';

type AuthScaffoldProps = { children: ReactNode; heightRatio: number };

export function AuthScaffold({ children, heightRatio }: AuthScaffoldProps) {
  const { height, width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const isTablet = isTabletWidth(width);
  const minHeightRatio = isTablet ? Math.min(heightRatio, 0.34) : heightRatio;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{ uri: AUTH_HERO_IMAGE_URL }}
        style={styles.hero}
      />
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View
          style={[
            styles.panel,
            isTablet && styles.tabletPanel,
            {
              minHeight: getAuthSheetHeight(height, minHeightRatio),
              paddingBottom: 22 + bottom,
              width: getAuthSheetWidth(width),
            },
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#111111', flex: 1 },
  hero: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'flex-end' },
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
