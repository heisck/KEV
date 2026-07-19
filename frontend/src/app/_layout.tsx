import {
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
  useFonts,
} from '@expo-google-fonts/fraunces';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/queryClient';
import { AppSplash } from '@/components/AppSplash';
import { ToastHost } from '@/components/ui/ToastHost';
import { logger } from '@/lib/logger';
import { initSentry, Sentry } from '@/lib/sentry';
import { useAuthStore } from '@/store/authStore';

initSentry();

// Native only — web has no OS splash; waiting on hideAsync stalls the intro.
if (Platform.OS !== 'web') {
  void SplashScreen.preventAutoHideAsync();
}

const FONT_TIMEOUT_MS = 2_500;

function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
  });
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRootLaidOut, setIsRootLaidOut] = useState(false);
  // Web: no native splash to hide — branded intro can start as soon as ready.
  const [isNativeSplashHidden, setIsNativeSplashHidden] = useState(Platform.OS === 'web');
  const [showSplash, setShowSplash] = useState(true);

  const fontsReady = fontsLoaded || Boolean(fontError) || fontsTimedOut;
  const isReady = isHydrated && fontsReady;
  const splashActive = isNativeSplashHidden && isReady;

  useEffect(() => {
    hydrate()
      .catch((error: unknown) => logger.warn('Failed to hydrate auth state', { error }))
      .finally(() => setIsHydrated(true));
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded || fontError) return undefined;
    const timer = setTimeout(() => setFontsTimedOut(true), FONT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === 'web' || !isReady || !isRootLaidOut || isNativeSplashHidden) return;

    SplashScreen.hideAsync()
      .catch((error: unknown) => logger.warn('Failed to hide native splash screen', { error }))
      .finally(() => setIsNativeSplashHidden(true));
  }, [isNativeSplashHidden, isReady, isRootLaidOut]);

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <GestureHandlerRootView style={styles.root} onLayout={() => setIsRootLaidOut(true)}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={DefaultTheme}>
            {/* File-based routes auto-register; only override presentation here. */}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="room-setup" options={{ presentation: 'modal' }} />
              <Stack.Screen name="student-result" options={{ presentation: 'modal' }} />
              <Stack.Screen name="upgrade" options={{ presentation: 'modal' }} />
            </Stack>
            <ToastHost />
            {showSplash ? (
              <AppSplash isActive={splashActive} onFinish={handleSplashFinish} />
            ) : null}
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default Sentry.wrap(RootLayout);
