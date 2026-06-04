import { create, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as Crypto from 'expo-crypto';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { tokenStore } from '@/lib/secureStore';

export const CORRELATION_HEADER = 'X-Correlation-Id';

/** Shared axios instance. Types for responses come from @kev/api-types. */
const apiConfig = {
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
};

export const api = create(apiConfig);
const authApi = create(apiConfig);

// Attach the bearer token and a per-request correlation id (propagated to the backend).
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStore.getAccess();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  config.headers.set(CORRELATION_HEADER, Crypto.randomUUID());
  return config;
});

// Single-flight refresh: on a 401, refresh once and replay the original request.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStore.getRefresh();
  if (!refreshToken) return null;
  try {
    const res = await authApi.post('/api/auth/refresh', { refreshToken });
    const next = res.data?.accessToken as string | undefined;
    if (!next) return null;
    await tokenStore.setTokens(next, refreshToken);
    return next;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });
      const token = await refreshing;
      if (token) {
        original.headers.set('Authorization', `Bearer ${token}`);
        return api(original);
      }
      await tokenStore.clear();
    }

    logger.error('API request failed', {
      url: error.config?.url,
      status: error.response?.status,
    });
    return Promise.reject(error);
  },
);
