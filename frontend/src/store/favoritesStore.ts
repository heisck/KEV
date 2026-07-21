import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoritesState = {
  byUser: Record<string, string[]>;
  toggle: (userId: string, examId: string) => void;
};

/** Per-lecturer favorites persisted across app restarts. */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      byUser: {},
      toggle: (userId, examId) =>
        set((state) => {
          const ids = new Set(state.byUser[userId] ?? []);
          if (ids.has(examId)) ids.delete(examId);
          else ids.add(examId);
          return { byUser: { ...state.byUser, [userId]: [...ids] } };
        }),
    }),
    {
      name: 'kev-favorites-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
