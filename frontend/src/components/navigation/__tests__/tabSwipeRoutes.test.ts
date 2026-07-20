import { adjacentTabRoute } from '@/components/navigation/tabSwipeRoutes';

describe('adjacentTabRoute', () => {
  it('does not navigate backward from Home', () => {
    expect(adjacentTabRoute('index', 'previous')).toBeNull();
  });

  it('moves backward through Profile, Chat, and Create', () => {
    expect(adjacentTabRoute('profile', 'previous')).toBe('/(tabs)/chat');
    expect(adjacentTabRoute('chat', 'previous')).toBe('/room-setup');
  });

  it('moves forward from Home and Chat', () => {
    expect(adjacentTabRoute('index', 'next')).toBe('/(tabs)/reminders');
    expect(adjacentTabRoute('chat', 'next')).toBe('/(tabs)/profile');
  });
});
