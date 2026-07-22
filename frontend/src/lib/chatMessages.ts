import type { ChatMessage } from '@/store/chatStore';

/** Validates backend chat rows and assigns each bubble to its sender. */
export function parseMessages(data: unknown, currentUserId?: string): ChatMessage[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((value) => {
    if (!value || typeof value !== 'object') return [];
    const message = value as Record<string, unknown>;
    if (
      (typeof message.id !== 'string' && typeof message.id !== 'number') ||
      typeof message.content !== 'string' ||
      typeof message.senderId !== 'string' ||
      typeof message.read !== 'boolean' ||
      (typeof message.createdAt !== 'string' && typeof message.createdAt !== 'number')
    ) {
      return [];
    }
    const mine = message.senderId === currentUserId;
    const createdAt = new Date(message.createdAt).toISOString();
    return [
      {
        id: String(message.id),
        text: message.content,
        mine,
        at: new Date(createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdAt,
        status: mine && !message.read ? 'sent' : 'read',
      },
    ];
  });
}
