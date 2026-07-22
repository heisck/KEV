import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  SessionDraftSchema,
  type SessionDraft,
  type WizardValues,
} from '@/components/session/sessionForm';
import { logger } from '@/lib/logger';

const SAVE_DELAY_MS = 150;

export function getSessionDraftKey(userId: string, sessionId?: number): string {
  return sessionId ? `session-draft:${userId}:edit:${sessionId}` : `session-draft:${userId}:create`;
}

export function useSessionDraft(key: string) {
  const [draft, setDraft] = useState<SessionDraft | null>(null);
  const [ready, setReady] = useState(false);
  const pending = useRef<SessionDraft | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (!pending.current) return;
    const value = pending.current;
    pending.current = null;
    AsyncStorage.setItem(key, JSON.stringify(value)).catch((error: unknown) =>
      logger.warn('Failed to persist session draft', { error: String(error) }),
    );
  }, [key]);

  useEffect(() => {
    let active = true;
    setReady(false);
    void AsyncStorage.getItem(key)
      .then((raw) => {
        if (!active) return;
        const parsed = raw ? SessionDraftSchema.safeParse(JSON.parse(raw) as unknown) : null;
        setDraft(parsed?.success ? parsed.data : null);
        setReady(true);
      })
      .catch((error: unknown) => {
        logger.warn('Failed to load session draft', { error: String(error) });
        if (active) setReady(true);
      });
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
      flush();
    };
  }, [flush, key]);

  const save = useCallback(
    (values: WizardValues, step: number) => {
      const parsed = SessionDraftSchema.safeParse({ values, step });
      if (!parsed.success) return;
      pending.current = parsed.data;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [flush],
  );

  const clear = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    pending.current = null;
    setDraft(null);
    await AsyncStorage.removeItem(key);
  }, [key]);

  return { clear, draft, ready, save };
}
