export type SwipeTab = 'index' | 'reminders' | 'chat' | 'profile';
export type SwipeDirection = 'previous' | 'next';

const ROUTES = [
  '/(tabs)',
  '/(tabs)/reminders',
  '/room-setup',
  '/(tabs)/chat',
  '/(tabs)/profile',
] as const;
const INDEX: Record<SwipeTab, number> = { index: 0, reminders: 1, chat: 3, profile: 4 };

/** Ordered destination for an edge swipe; Home has no previous destination. */
export function adjacentTabRoute(tab: SwipeTab, direction: SwipeDirection) {
  const target = INDEX[tab] + (direction === 'previous' ? -1 : 1);
  return ROUTES[target] ?? null;
}
