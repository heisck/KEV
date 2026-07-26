import { create } from 'zustand';

import {
  autoClearEndedSessionRoster,
  cacheSessionStudents,
  clearSessionStudents,
  fetchStudentsFromExternalSync,
  flushPendingResults,
  getCachedStudents,
  queueVerificationResult,
  type ExternalStudentData,
  type SyncRequestPayload,
  type VerificationResultItem,
} from '@/services/syncService';

type SyncState = {
  isSyncing: boolean;
  syncProgress: number; // 0..1
  syncMessage: string;
  externalSessionId: string | null;
  cachedRoster: Record<string, ExternalStudentData[]>;
  startSync: (payload: SyncRequestPayload, appSessionId?: string) => Promise<string | null>;
  recordVerification: (sessionId: string, result: VerificationResultItem) => Promise<void>;
  syncSessionResults: (sessionId: string) => Promise<boolean>;
  loadCachedStudents: (sessionId: string) => Promise<ExternalStudentData[]>;
  clearRoster: (sessionId: string) => Promise<void>;
  purgeEndedSessionRoster: (sessionId: string) => Promise<void>;
  setSyncProgress: (progress: number, message?: string) => void;
};

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  syncProgress: 0,
  syncMessage: '',
  externalSessionId: null,
  cachedRoster: {},

  setSyncProgress: (progress, message) =>
    set((s) => ({
      syncProgress: Math.min(Math.max(progress, 0), 1),
      syncMessage: message ?? s.syncMessage,
    })),

  startSync: async (payload, appSessionId) => {
    set({ isSyncing: true, syncProgress: 0.05, syncMessage: 'Starting student data sync...' });
    try {
      const response = await fetchStudentsFromExternalSync(payload, (percent, status) => {
        set({ syncProgress: percent / 100, syncMessage: status });
      });

      if (response.sessionId && response.data) {
        await cacheSessionStudents(response.sessionId, response.data, {
          indexFrom: payload.indexFrom,
          indexTo: payload.indexTo,
          count: response.count,
          appSessionId,
        });
        set((s) => ({
          externalSessionId: response.sessionId,
          cachedRoster: {
            ...s.cachedRoster,
            [response.sessionId]: response.data,
            ...(appSessionId ? { [appSessionId]: response.data } : {}),
          },
        }));
        return response.sessionId;
      }
      return null;
    } catch (error) {
      set({ syncMessage: 'Sync failed. Working in offline mode.' });
      throw error;
    } finally {
      setTimeout(() => {
        set({ isSyncing: false, syncProgress: 1 });
      }, 500);
    }
  },

  recordVerification: async (sessionId, result) => {
    await queueVerificationResult(sessionId, result);
    // Background flush attempt
    void flushPendingResults(sessionId);
  },

  syncSessionResults: async (sessionId) => {
    const res = await flushPendingResults(sessionId);
    return res?.success ?? false;
  },

  loadCachedStudents: async (sessionId) => {
    const cached = get().cachedRoster[sessionId];
    if (cached && cached.length > 0) return cached;
    const loaded = await getCachedStudents(sessionId);
    set((s) => ({
      cachedRoster: { ...s.cachedRoster, [sessionId]: loaded },
    }));
    return loaded;
  },

  clearRoster: async (sessionId) => {
    await clearSessionStudents(sessionId);
    set((s) => {
      const next = { ...s.cachedRoster };
      delete next[sessionId];
      return { cachedRoster: next };
    });
  },

  purgeEndedSessionRoster: async (sessionId) => {
    await autoClearEndedSessionRoster(sessionId);
    set((s) => {
      const next = { ...s.cachedRoster };
      delete next[sessionId];
      return { cachedRoster: next };
    });
  },
}));
