import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ClearedSessionsState = {
  byUser: Record<string, string[]>;
  clear: (userId: string, sessionIds: string[]) => void;
};

export const useClearedSessionsStore = create<ClearedSessionsState>()(
  persist(
    (set) => ({
      byUser: {},
      clear: (userId, sessionIds) =>
        set((state) => ({
          byUser: {
            ...state.byUser,
            [userId]: [...new Set([...(state.byUser[userId] ?? []), ...sessionIds])],
          },
        })),
    }),
    {
      name: 'kev-cleared-sessions-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
