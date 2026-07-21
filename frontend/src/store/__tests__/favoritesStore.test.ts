import AsyncStorage from '@react-native-async-storage/async-storage';
import { waitFor } from '@testing-library/react-native';

import { useFavoritesStore } from '@/store/favoritesStore';

beforeEach(async () => {
  await AsyncStorage.clear();
  useFavoritesStore.setState({ byUser: {} });
});

it('persists favorites separately for each lecturer', async () => {
  useFavoritesStore.getState().toggle('lecturer-a', 'session-1');
  useFavoritesStore.getState().toggle('lecturer-b', 'session-2');

  let stored: string | null = null;
  await waitFor(async () => {
    stored = await AsyncStorage.getItem('kev-favorites-v1');
    expect(stored).toContain('session-1');
    expect(stored).toContain('session-2');
  });

  useFavoritesStore.setState({ byUser: {} });
  await AsyncStorage.setItem('kev-favorites-v1', stored ?? '');
  await useFavoritesStore.persist.rehydrate();

  expect(useFavoritesStore.getState().byUser['lecturer-a']).toEqual(['session-1']);
  expect(useFavoritesStore.getState().byUser['lecturer-b']).toEqual(['session-2']);
});
