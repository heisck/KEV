import { type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const isTablet = isTabletWidth(width);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <StatusBar style="light" />
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{ uri: AUTH_HERO_IMAGE_URL }}
        style={styles.hero}
      />
      <SafeAreaView edges={['bottom']} style={styles.content}>
        <View
          style={[
            styles.panel,
            isTablet && styles.tabletPanel,
            isTablet
              ? { minHeight: getAuthSheetHeight(height, Math.min(heightRatio, 0.34)) }
              : { height: getAuthSheetHeight(height, heightRatio) },
            { width: getAuthSheetWidth(width) },
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#111111', flex: 1 },
  hero: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  content: { flex: 1, justifyContent: 'flex-end' },
  panel: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    elevation: 10,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingBottom: 22,
    paddingHorizontal: 24,
    paddingTop: 26,
    shadowColor: '#111111',
    shadowOffset: { height: -6, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  tabletPanel: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
});
