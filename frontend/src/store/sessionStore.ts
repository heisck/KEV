import { create } from 'zustand';

import type { ScannedStudent } from '@/data/exams';

type SessionState = {
  /** Session ids this device has joined (entered the correct password for). */
  joined: Record<string, true>;
  join: (sessionId: string) => void;
  /** Students added by scanning, per session. */
  roster: Record<string, ScannedStudent[]>;
  addStudent: (sessionId: string, student: ScannedStudent) => void;
};

/** In-memory join/scan state; swap for the backend session API when it lands. */
export const useSessionStore = create<SessionState>((set) => ({
  joined: {},
  join: (sessionId) => set((s) => ({ joined: { ...s.joined, [sessionId]: true } })),
  roster: {},
  addStudent: (sessionId, student) =>
    set((s) => {
      const current = s.roster[sessionId] ?? [];
      if (current.some((st) => st.id === student.id)) return s;
      return { roster: { ...s.roster, [sessionId]: [...current, student] } };
    }),
}));
