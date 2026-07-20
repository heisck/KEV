import { create } from 'zustand';

import type { ScannedStudent } from '@/data/exams';

type SessionState = {
  /** Session ids this device has joined (entered the correct password for). */
  joined: Record<string, true>;
  join: (sessionId: string) => void;
  /** Session retained while moving between verification methods. */
  lockedSessionId: string | null;
  toggleSessionLock: (sessionId: string) => void;
  /** Students added by scanning, per session. */
  roster: Record<string, ScannedStudent[]>;
  addStudent: (sessionId: string, student: ScannedStudent) => void;
  removeStudent: (sessionId: string, studentId: string) => void;
};

/** In-memory join/scan state; swap for the backend session API when it lands. */
export const useSessionStore = create<SessionState>((set) => ({
  joined: {},
  join: (sessionId) => set((s) => ({ joined: { ...s.joined, [sessionId]: true } })),
  lockedSessionId: null,
  toggleSessionLock: (sessionId) =>
    set((s) => ({ lockedSessionId: s.lockedSessionId === sessionId ? null : sessionId })),
  roster: {},
  addStudent: (sessionId, student) =>
    set((s) => {
      const current = s.roster[sessionId] ?? [];
      const existing = current.findIndex((item) => item.id === student.id);
      const roster =
        existing < 0
          ? [...current, student]
          : current.map((item, index) => (index === existing ? { ...item, ...student } : item));
      return { roster: { ...s.roster, [sessionId]: roster } };
    }),
  removeStudent: (sessionId, studentId) =>
    set((state) => ({
      roster: {
        ...state.roster,
        [sessionId]: (state.roster[sessionId] ?? []).filter((student) => student.id !== studentId),
      },
    })),
}));
