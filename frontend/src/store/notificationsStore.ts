import { create } from 'zustand';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
};

type NotificationsState = {
  items: AppNotification[];
  unreadCount: () => number;
  markAllRead: () => void;
  markRead: (id: string) => void;
};

const SEED: AppNotification[] = [
  {
    id: 'n1',
    title: 'Session starting soon',
    body: 'MA 204 begins in 30 minutes — Hall A.',
    at: '08:30',
    read: false,
  },
  {
    id: 'n2',
    title: 'Roster updated',
    body: '3 students added to CS 101.',
    at: 'Yesterday',
    read: false,
  },
  {
    id: 'n3',
    title: 'Scan complete',
    body: 'PH 110 attendance locked (139 verified).',
    at: 'Mon',
    read: true,
  },
];

/** In-app notifications feed (local until push/API lands). */
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: SEED,
  unreadCount: () => get().items.filter((n) => !n.read).length,
  markAllRead: () => set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
}));
