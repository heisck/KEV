import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export type ToastItem = { id: number; message: string; tone: ToastTone };

const AUTO_DISMISS_MS = 3500;
let nextId = 1;

type ToastState = {
  toasts: ToastItem[];
  show: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
};

/** App-wide toast queue; render via <ToastHost /> once at the root. */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show(message, tone = 'info') {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      AUTO_DISMISS_MS,
    );
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
};
