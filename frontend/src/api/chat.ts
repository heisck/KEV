import { z } from 'zod';
import { api } from '@/api/client';
import { UserDtoSchema, type UserDto } from '@/api/schemas';

const MessageDtoSchema = z.object({
  id: z.number(),
  conversationId: z.number(),
  senderId: z.string().uuid(),
  content: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});

export const ConversationSummarySchema = z.object({
  peer: UserDtoSchema,
  lastMessage: MessageDtoSchema,
  unreadCount: z.number().nonnegative(),
});
export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;

/** Lecturer/admin directory for the chat picker — not admin-gated (any signed-in user). */
export async function listLecturers(q?: string): Promise<UserDto[]> {
  const res = await api.get('/api/chat/lecturers', { params: q ? { q } : undefined });
  return z.array(UserDtoSchema).parse(res.data);
}

export async function listConversations(): Promise<ConversationSummary[]> {
  const response = await api.get('/api/chat/conversations');
  return z.array(ConversationSummarySchema).parse(response.data);
}

export async function listMessages(peerId: string): Promise<unknown> {
  const response = await api.get(`/api/chat/conversations/${peerId}/messages`);
  return response.data;
}

export async function sendMessage(peerId: string, content: string): Promise<unknown> {
  const response = await api.post(`/api/chat/conversations/${peerId}/messages`, { content });
  return response.data;
}

export async function markConversationRead(peerId: string): Promise<void> {
  await api.post(`/api/chat/conversations/${peerId}/read`);
}
