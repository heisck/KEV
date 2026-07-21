import { create } from 'zustand';

export type ChatMessage = { id: string; text: string; mine: boolean; at: string };

type ChatState = {
  /** Messages per lecturer id, oldest first. */
  threads: Record<string, ChatMessage[]>;
  /** Currently open thread in the Chat tab (null = inbox list). */
  activeLecturerId: string | null;
  appendMessage: (lecturerId: string, message: ChatMessage) => void;
  openThread: (lecturerId: string) => void;
  closeThread: () => void;
  setThreadMessages: (lecturerId: string, messages: ChatMessage[]) => void;
};

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
  appendMessage: (lecturerId, message) => {
    set((s) => {
      const current = s.threads[lecturerId] ?? [];
      if (current.some((item) => item.id === message.id)) return s;
      return { threads: { ...s.threads, [lecturerId]: [...current, message] } };
    });
  },
  setThreadMessages: (lecturerId, messages) => {
    set((s) => ({
      threads: {
        ...s.threads,
        [lecturerId]: [...new Map(messages.map((message) => [message.id, message])).values()],
      },
    }));
  },
}));
