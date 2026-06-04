import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'kev.accessToken';
const REFRESH_KEY = 'kev.refreshToken';

/** Encrypted on-device storage for JWTs (Keychain on iOS, Keystore on Android). */
export const tokenStore = {
  getAccess: () => SecureStore.getItemAsync(ACCESS_KEY),
  getRefresh: () => SecureStore.getItemAsync(REFRESH_KEY),
  async setTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  },
};
