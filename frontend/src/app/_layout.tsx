import {
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
  useFonts,
} from '@expo-google-fonts/fraunces';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/queryClient';
import { AppSplash } from '@/components/AppSplash';
import { logger } from '@/lib/logger';
import { initSentry, Sentry } from '@/lib/sentry';
import { useAuthStore } from '@/store/authStore';

initSentry();
void SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const colorScheme = useColorScheme();
  const hydrate = useAuthStore((s) => s.hydrate);
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRootLaidOut, setIsRootLaidOut] = useState(false);
  const [isNativeSplashHidden, setIsNativeSplashHidden] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const isReady = isHydrated && (fontsLoaded || Boolean(fontError));

  useEffect(() => {
    hydrate()
      .catch((error: unknown) => logger.warn('Failed to hydrate auth state', { error }))
      .finally(() => setIsHydrated(true));
  }, [hydrate]);

  useEffect(() => {
    if (!isReady || !isRootLaidOut || isNativeSplashHidden) return;

    SplashScreen.hideAsync()
      .catch((error: unknown) => logger.warn('Failed to hide native splash screen', { error }))
      .finally(() => setIsNativeSplashHidden(true));
  }, [isNativeSplashHidden, isReady, isRootLaidOut]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={() => setIsRootLaidOut(true)}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="room-setup" options={{ presentation: 'modal' }} />
              <Stack.Screen name="student-result" options={{ presentation: 'modal' }} />
              <Stack.Screen name="upgrade" options={{ presentation: 'modal' }} />
            </Stack>
            {showSplash ? (
              <AppSplash isActive={isNativeSplashHidden} onFinish={handleSplashFinish} />
            ) : null}
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Sentry.wrap enables error boundaries + performance tracing at the app root.
export default Sentry.wrap(RootLayout);
