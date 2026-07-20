import { z } from 'zod';

import { api } from '@/api/client';
import type {
  AppNotification,
  NotificationDay,
  NotificationIcon,
} from '@/store/notificationsStore';

const NotificationDtoSchema = z.object({
  id: z.number(),
  userId: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});

function dayFor(date: Date, now: Date): NotificationDay {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (itemDay === start) return 'today';
  if (itemDay === start - 86_400_000) return 'yesterday';
  return 'earlier';
}

function relativeTime(date: Date, now: Date) {
  const minutes = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000));
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function iconFor(type: string): NotificationIcon {
  if (type === 'CHAT') return 'reminder';
  if (type === 'SUCCESS') return 'complete';
  return 'focus';
}

export function parseNotifications(data: unknown, now = new Date()): AppNotification[] {
  return z
    .array(NotificationDtoSchema)
    .parse(data)
    .map((item) => {
      const createdAt = new Date(item.createdAt);
      return {
        id: String(item.id),
        title: item.title,
        body: item.message,
        at: relativeTime(createdAt, now),
        day: dayFor(createdAt, now),
        icon: iconFor(item.type),
        read: item.read,
      };
    });
}

export async function listNotifications() {
  const response = await api.get('/api/notifications');
  return parseNotifications(response.data);
}

export async function markNotificationRead(id: string) {
  await api.post(`/api/notifications/${id}/read`);
}

export async function deleteNotification(id: string) {
  await api.delete(`/api/notifications/${id}`);
}
