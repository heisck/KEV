import { useEffect, useRef } from 'react';

import { useNotifications } from '@/api/hooks';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useSettingsStore } from '@/store/settingsStore';

/** Polls persisted notifications and previews new unread items while the app is open. */
export function NotificationSync() {
  const userId = useAuthStore((state) => state.user?.id);
  const enabled = useSettingsStore((state) => state.notificationsEnabled);
  const reset = useNotificationsStore((state) => state.reset);
  const replace = useNotificationsStore((state) => state.replace);
  const seen = useRef(new Set<string>());
  const initialized = useRef(false);
  const { data, isError } = useNotifications(Boolean(userId) && enabled);

  useEffect(() => {
    seen.current.clear();
    initialized.current = false;
    reset();
    if (!userId || !enabled) replace([]);
  }, [enabled, replace, reset, userId]);

  useEffect(() => {
    if (!data) return;
    const isFirstFetch = !initialized.current;

    // Find new unread item
    const preview = isFirstFetch
      ? null
      : data.find((item) => !item.read && !seen.current.has(item.id));

    data.forEach((item) => seen.current.add(item.id));
    replace(data);
    initialized.current = true;

    // Toast only newly arrived notifications (excluding welcome messages) during active session
    if (preview && !preview.title.toLowerCase().includes('welcome')) {
      toast.info(`${preview.title}: ${preview.body}`);
    }
  }, [data, replace]);

  useEffect(() => {
    if (isError && !data) replace([]);
  }, [data, isError, replace]);

  return null;
}
