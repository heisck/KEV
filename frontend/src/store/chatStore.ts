import { create } from 'zustand';

export type ChatMessage = { id: string; text: string; mine: boolean; at: string };

type ChatState = {
  /** Messages per lecturer id, oldest first. */
  threads: Record<string, ChatMessage[]>;
  /** Currently open thread in the Chat tab (null = inbox list). */
  activeLecturerId: string | null;
  openThread: (lecturerId: string) => void;
  closeThread: () => void;
  send: (lecturerId: string, text: string) => void;
};

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const SEED: Record<string, ChatMessage[]> = {
  i1: [{ id: 'seed-i1', text: 'Hall A is set up, scanners tested.', mine: false, at: '08:45' }],
  i2: [{ id: 'seed-i2', text: 'Roster synced for MA 204.', mine: false, at: '08:52' }],
};

/** In-app lecturer chat; local mock until the messaging API lands. */
export const useChatStore = create<ChatState>((set, get) => ({
  threads: SEED,
  activeLecturerId: null,
  openThread: (lecturerId) => {
    set((s) => ({
      activeLecturerId: lecturerId,
      // Ensure an empty thread exists so the UI leaves the inbox empty-state.
      threads: s.threads[lecturerId] ? s.threads : { ...s.threads, [lecturerId]: [] },
    }));
  },
  closeThread: () => set({ activeLecturerId: null }),
  send: (lecturerId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const mine: ChatMessage = { id: `m-${Date.now()}`, text: trimmed, mine: true, at: now() };
    set((s) => ({
      threads: { ...s.threads, [lecturerId]: [...(s.threads[lecturerId] ?? []), mine] },
    }));
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `r-${Date.now()}`,
        text: 'Got it — thanks.',
        mine: false,
        at: now(),
      };
      set((s) => ({
        threads: { ...s.threads, [lecturerId]: [...(s.threads[lecturerId] ?? []), reply] },
      }));
    }, 900);
  },
}));
