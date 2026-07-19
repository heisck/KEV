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
  setThreadMessages: (lecturerId: string, messages: ChatMessage[]) => void;
};

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** In-app lecturer chat state connecting to the real messaging API. */
export const useChatStore = create<ChatState>((set) => ({
  threads: {},
  activeLecturerId: null,
  openThread: (lecturerId) => {
    set((s) => ({
      activeLecturerId: lecturerId,
      threads: s.threads[lecturerId] ? s.threads : { ...s.threads, [lecturerId]: [] },
    }));
  },
  closeThread: () => set({ activeLecturerId: null }),
  setThreadMessages: (lecturerId, messages) => {
    set((s) => ({
      threads: { ...s.threads, [lecturerId]: messages },
    }));
  },
  send: (lecturerId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const mine: ChatMessage = { id: `m-${Date.now()}`, text: trimmed, mine: true, at: now() };
    set((s) => ({
      threads: { ...s.threads, [lecturerId]: [...(s.threads[lecturerId] ?? []), mine] },
    }));
  },
}));
