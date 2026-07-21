import { create } from 'zustand';

/** Visual badge + which filter bucket a notification falls under. */
export type NotificationIcon = 'focus' | 'progress' | 'complete' | 'break' | 'reminder';
export type NotificationDay = 'today' | 'yesterday' | 'earlier';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  at: string;
  day: NotificationDay;
  icon: NotificationIcon;
  read: boolean;
};

type NotificationsState = {
  items: AppNotification[];
  loaded: boolean;
  unreadCount: () => number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  reset: () => void;
  replace: (items: AppNotification[]) => void;
};

/** In-app mirror of the persisted notification feed. */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  loaded: false,
  unreadCount: () => get().items.filter((n) => !n.read).length,
  markAllRead: () => set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  remove: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
  reset: () => set({ items: [], loaded: false }),
  replace: (items) => set({ items, loaded: true }),
}));
