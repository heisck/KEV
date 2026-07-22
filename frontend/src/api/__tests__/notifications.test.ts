import { parseNotifications } from '@/api/notifications';

describe('notification API parsing', () => {
  it('maps a chat notification into an in-app message preview', () => {
    const items = parseNotifications([
      {
        id: 4,
        userId: 'd9a36b8a-6170-455d-9b46-2d2a78959980',
        title: 'New message from Dr. Ama',
        message: 'Can you join my session?',
        type: 'CHAT:8d91fa4d-6d41-4610-9137-7c75f1d417b9',
        read: false,
        createdAt: '2026-07-20T14:00:00Z',
      },
    ]);

    expect(items[0]).toMatchObject({
      id: '4',
      title: 'New message from Dr. Ama',
      body: 'Can you join my session?',
      icon: 'reminder',
      kind: 'CHAT',
      targetId: '8d91fa4d-6d41-4610-9137-7c75f1d417b9',
      read: false,
    });
  });

  it('rejects malformed notification responses', () => {
    expect(() => parseNotifications([{ id: 'bad' }])).toThrow();
  });
});
