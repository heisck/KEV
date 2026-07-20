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
  unreadCount: () => number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
};

const SEED: AppNotification[] = [
  {
    id: 'n1',
    title: 'Session starting soon',
    body: 'MA 204 begins in 30 minutes — Hall A.',
    at: '1h ago',
    day: 'today',
    icon: 'reminder',
    read: false,
  },
  {
    id: 'n2',
    title: "You're halfway there",
    body: 'CS 101 is 50% checked in — keep going.',
    at: '2h ago',
    day: 'today',
    icon: 'progress',
    read: false,
  },
  {
    id: 'n3',
    title: 'Session started',
    body: 'PH 110 attendance is now open.',
    at: '3h ago',
    day: 'today',
    icon: 'focus',
    read: false,
  },
  {
    id: 'n4',
    title: 'Scan complete',
    body: 'PH 110 attendance locked — 139 verified.',
    at: 'Yesterday',
    day: 'yesterday',
    icon: 'complete',
    read: true,
  },
  {
    id: 'n5',
    title: 'Roster updated',
    body: '3 students added to CS 101.',
    at: 'Yesterday',
    day: 'yesterday',
    icon: 'reminder',
    read: true,
  },
  {
    id: 'n6',
    title: 'Time for a break',
    body: 'Long day — MA 204 wrapped up cleanly.',
    at: 'Mon',
    day: 'earlier',
    icon: 'break',
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
  remove: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
}));
