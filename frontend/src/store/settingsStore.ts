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
      showSuccessPage: true,
      setShowSuccessPage: (showSuccessPage) => set({ showSuccessPage }),
      notificationsEnabled: true,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'kev-settings',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // v0 stored a `darkMode` boolean; map it onto the new `theme` field.
      migrate: (state, version) => {
        if (version === 0 && state && typeof state === 'object') {
          const { darkMode, ...rest } = state as { darkMode?: boolean };
          return { ...rest, theme: darkMode ? 'dark' : 'light' } as SettingsState;
        }
        return state as SettingsState;
      },
    },
  ),
);
