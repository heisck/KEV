import { create } from 'zustand';

type SettingsState = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
};

/** User preferences (theme + notification opt-in). */
export const useSettingsStore = create<SettingsState>((set) => ({
  darkMode: false,
  setDarkMode: (darkMode) => set({ darkMode }),
  notificationsEnabled: true,
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
}));
