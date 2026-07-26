import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/config/env';
import { logger } from '@/lib/logger';

export type ExternalStudentData = {
  id: string;
  firstName: string;
  lastName: string;
  indexNumber: string;
  studentId: string;
  nfcCode: string;
  imageUrl?: string;
  imageBase64?: string;
};

export type SyncRequestPayload = {
  indexFrom: number | string;
  indexTo: number | string;
  requestedBy?: string;
  deviceInfo?: string;
};

export type SyncRequestResponse = {
  success: boolean;
  sessionId: string;
  count: number;
  data: ExternalStudentData[];
};

export type VerificationResultItem = {
  indexNumber: string;
  verified: boolean;
  verifiedAt: string;
  verifiedBy?: string;
  confidence?: number;
  metadata?: string;
};

export type SyncResultsPayload = {
  sessionId?: string;
  results: VerificationResultItem[];
};

export type SyncResultsResponse = {
  success: boolean;
  message?: string;
  processed: number;
  conflicts: number;
  conflictDetails?: {
    indexNumber: string;
    reason: string;
    existingTime: string;
    newTime: string;
  }[];
};

export const getExternalSyncBaseUrl = (): string =>
  env.externalSyncUrl || 'https://kev-uits-rep.vercel.app';

const STORAGE_KEYS = {
  students: (sessionId: string) => `sync:session:${sessionId}:students`,
  meta: (sessionId: string) => `sync:session:${sessionId}:meta`,
  queue: (sessionId: string) => `sync:queue:${sessionId}`,
  allSessions: 'sync:sessions:list',
};

export async function fetchStudentsFromExternalSync(
  payload: SyncRequestPayload,
  onProgress?: (percent: number, status: string) => void,
): Promise<SyncRequestResponse> {
  onProgress?.(5, 'Connecting to student database...');

  const response = await fetch(`${getExternalSyncBaseUrl()}/api/sync/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      indexFrom: Number(payload.indexFrom),
      indexTo: Number(payload.indexTo),
      requestedBy: payload.requestedBy ?? 'UITS App',
      deviceInfo: payload.deviceInfo ?? 'React Native Mobile',
    }),
  });

  onProgress?.(30, 'Receiving student package...');

  if (!response.ok) {
    throw new Error(`Sync request failed with status ${response.status}`);
  }

  const result = (await response.json()) as SyncRequestResponse;
  onProgress?.(60, `Received ${result.count ?? result.data?.length ?? 0} student records...`);

  if (result.sessionId && Array.isArray(result.data)) {
    await cacheSessionStudents(result.sessionId, result.data, {
      indexFrom: payload.indexFrom,
      indexTo: payload.indexTo,
      count: result.count,
    });
  }

  onProgress?.(100, 'Student data cached offline successfully!');
  return result;
}

export async function sendVerificationResults(
  payload: SyncResultsPayload,
): Promise<SyncResultsResponse> {
  const response = await fetch(`${getExternalSyncBaseUrl()}/api/sync/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Sync results failed with status ${response.status}`);
  }

  const data = (await response.json()) as SyncResultsResponse;
  if (data.success && payload.sessionId) {
    await clearQueueForSession(payload.sessionId);
  }
  return data;
}

export async function cacheSessionStudents(
  sessionId: string,
  students: ExternalStudentData[],
  metaInfo?: { indexFrom?: number | string; indexTo?: number | string; count?: number },
): Promise<void> {
  try {
    const meta = {
      sessionId,
      count: students.length,
      syncedAt: new Date().toISOString(),
      ...metaInfo,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.students(sessionId), JSON.stringify(students));
    await AsyncStorage.setItem(STORAGE_KEYS.meta(sessionId), JSON.stringify(meta));

    const existingListRaw = await AsyncStorage.getItem(STORAGE_KEYS.allSessions);
    const existingList: string[] = existingListRaw ? JSON.parse(existingListRaw) : [];
    if (!existingList.includes(sessionId)) {
      existingList.push(sessionId);
      await AsyncStorage.setItem(STORAGE_KEYS.allSessions, JSON.stringify(existingList));
    }
  } catch (error) {
    logger.warn('Failed to cache session students offline', { error: String(error) });
  }
}

export async function getCachedStudents(sessionId: string): Promise<ExternalStudentData[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.students(sessionId));
    return raw ? (JSON.parse(raw) as ExternalStudentData[]) : [];
  } catch {
    return [];
  }
}

export async function lookupStudentOffline(
  indexNumber: string,
  sessionId?: string,
): Promise<ExternalStudentData | null> {
  if (sessionId) {
    const students = await getCachedStudents(sessionId);
    const match = students.find((s) => s.indexNumber === indexNumber || s.nfcCode === indexNumber);
    if (match) return match;
  }

  // Fallback: search across all cached sessions
  try {
    const existingListRaw = await AsyncStorage.getItem(STORAGE_KEYS.allSessions);
    const sessionIds: string[] = existingListRaw ? JSON.parse(existingListRaw) : [];
    for (const id of sessionIds) {
      const students = await getCachedStudents(id);
      const found = students.find(
        (s) => s.indexNumber === indexNumber || s.nfcCode === indexNumber,
      );
      if (found) return found;
    }
  } catch {
    // Ignore error
  }
  return null;
}

export async function queueVerificationResult(
  sessionId: string,
  result: VerificationResultItem,
): Promise<void> {
  try {
    const queueKey = STORAGE_KEYS.queue(sessionId);
    const raw = await AsyncStorage.getItem(queueKey);
    const items: VerificationResultItem[] = raw ? JSON.parse(raw) : [];
    const idx = items.findIndex((i) => i.indexNumber === result.indexNumber);
    if (idx >= 0) {
      items[idx] = result;
    } else {
      items.push(result);
    }
    await AsyncStorage.setItem(queueKey, JSON.stringify(items));
  } catch (error) {
    logger.warn('Failed to queue verification result', { error: String(error) });
  }
}

export async function getPendingResultsForSession(
  sessionId: string,
): Promise<VerificationResultItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.queue(sessionId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearQueueForSession(sessionId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.queue(sessionId));
  } catch {
    // Ignore error
  }
}

export async function flushPendingResults(sessionId: string): Promise<SyncResultsResponse | null> {
  const pending = await getPendingResultsForSession(sessionId);
  if (pending.length === 0) return null;
  try {
    return await sendVerificationResults({ sessionId, results: pending });
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      logger.warn('Background sync flush failed, will retry later', { error: String(error) });
    }
    return null;
  }
}
