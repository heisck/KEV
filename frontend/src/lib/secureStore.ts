import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'kev.accessToken';
const REFRESH_KEY = 'kev.refreshToken';

/** Web has no Keychain/Keystore — sessionStorage is best-effort for dev previews. */
const webStore = {
  getItem: (key: string) =>
    Promise.resolve(typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(key)),
  setItem: (key: string, value: string) => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, value);
    return Promise.resolve();
  },
  deleteItem: (key: string) => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(key);
    return Promise.resolve();
  },
};

const store =
  Platform.OS === 'web'
    ? webStore
    : {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        deleteItem: (key: string) => SecureStore.deleteItemAsync(key),
      };

/** Encrypted on-device storage for JWTs (Keychain on iOS, Keystore on Android). */
export const tokenStore = {
  getAccess: () => store.getItem(ACCESS_KEY),
  getRefresh: () => store.getItem(REFRESH_KEY),
  async setTokens(accessToken: string, refreshToken: string) {
    await store.setItem(ACCESS_KEY, accessToken);
    await store.setItem(REFRESH_KEY, refreshToken);
  },
  async clear() {
    await store.deleteItem(ACCESS_KEY);
    await store.deleteItem(REFRESH_KEY);
  },
};
