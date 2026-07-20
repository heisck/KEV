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
      (typeof message.createdAt !== 'string' && typeof message.createdAt !== 'number')
    ) {
      return [];
    }
    return [
      {
        id: String(message.id),
        text: message.content,
        mine: message.senderId === currentUserId,
        at: new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ];
  });
}
