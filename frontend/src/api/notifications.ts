import { z } from 'zod';

import { api } from '@/api/client';
import { formatRelativeTime, getDayBucket } from '@/lib/date';
import type { AppNotification, NotificationIcon } from '@/store/notificationsStore';

const NotificationDtoSchema = z.object({
  id: z.number(),
  userId: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});

function iconFor(type: string): NotificationIcon {
  if (type.startsWith('CHAT')) return 'reminder';
  if (type.startsWith('REPORT')) return 'progress';
  if (type === 'SUCCESS') return 'complete';
  return 'focus';
}

export function parseNotifications(data: unknown, now = new Date()): AppNotification[] {
  return z
    .array(NotificationDtoSchema)
    .parse(data)
    .map((item) => {
      const createdAt = new Date(item.createdAt);
      const [rawKind, targetId] = item.type.split(':', 2);
      const kind = ['CHAT', 'REPORT', 'SESSION'].includes(rawKind)
        ? (rawKind as AppNotification['kind'])
        : 'INFO';
      return {
        id: String(item.id),
        title: item.title,
        body: item.message,
        at: formatRelativeTime(createdAt, now),
        day: getDayBucket(createdAt, now),
        icon: iconFor(item.type),
        read: item.read,
        kind,
        targetId,
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
