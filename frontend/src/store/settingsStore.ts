import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CheckInMethod } from '@/api/schemas';

export type ThemePreference = 'light' | 'dark' | 'system';

type SettingsState = {
  /** 'system' follows the OS appearance; light/dark force it. */
  theme: ThemePreference;
  setTheme: (value: ThemePreference) => void;
  /** Verification method the scan hub opens with. */
  defaultScanMethod: CheckInMethod;
  setDefaultScanMethod: (value: CheckInMethod) => void;
  useAllScanMethods: boolean;
  setUseAllScanMethods: (value: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (value: boolean) => void;
  /** When true, a scan opens the full result page; off = instant toast + haptic. */
  showSuccessPage: boolean;
  setShowSuccessPage: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
};

/** User preferences (theme, scan defaults, notifications) — persisted across restarts. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      defaultScanMethod: 'FACE',
      setDefaultScanMethod: (defaultScanMethod) => set({ defaultScanMethod }),
      useAllScanMethods: true,
      setUseAllScanMethods: (useAllScanMethods) => set({ useAllScanMethods }),
      hapticsEnabled: true,
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      showSuccessPage: true,
      setShowSuccessPage: (showSuccessPage) => set({ showSuccessPage }),
      notificationsEnabled: true,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'kev-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      // v0 stored a `darkMode` boolean; map it onto the new `theme` field.
      migrate: (state, version) => {
        if (!state || typeof state !== 'object') return state as SettingsState;
        const prior = state as Partial<SettingsState> & { darkMode?: boolean };
        const theme = version === 0 ? (prior.darkMode ? 'dark' : 'light') : prior.theme;
        return {
          ...prior,
          theme,
          hapticsEnabled: prior.hapticsEnabled ?? true,
          useAllScanMethods: prior.useAllScanMethods ?? true,
        } as SettingsState;
      },
    },
  ),
);
